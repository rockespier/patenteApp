using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PatenteApp.Api.Infrastructure.Settings;
using PatenteApp.Domain.Entities; // Asumiendo que copiaste tus entidades aquí
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración fuertemente tipada (Options Pattern)
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// 2. Configurar CORS (Permitir a Angular conectarse)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy => policy.WithOrigins("http://localhost:4200") // Puerto por defecto de Angular
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 3. Inyección de Dependencias: MongoDB
// Trade-off: MongoClient DEBE ser Singleton por mejores prácticas para reutilizar el pool de conexiones
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

// Scoped: Se crea una instancia por cada petición HTTP
builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return client.GetDatabase(settings.DatabaseName);
});

// --- CONFIGURACIÓN DE FIREBASE AUTH ---
var firebaseProjectId = "patenteapp-415a9"; // Cámbialo por tu ID real

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"--- ERROR DE AUTENTICACIÓN: {context.Exception.Message} ---");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("--- TOKEN VALIDADO EXITOSAMENTE ---");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Usar CORS
app.UseCors("AllowAngularApp");

// MUY IMPORTANTE: Estos dos deben ir entre UseCors y los endpoints
app.UseAuthentication();
app.UseAuthorization();


// --- ENDPOINTS (Minimal APIs) ---

// GET: /api/questions/simulate
app.MapGet("/api/questions/simulate", async (IMongoDatabase db) =>
{
    var collection = db.GetCollection<Question>("Questions");

    // Utilizamos $sample de MongoDB para obtener 30 documentos aleatorios de forma muy eficiente
    var pipeline = new EmptyPipelineDefinition<Question>().Sample(30);
    var randomQuestions = await collection.Aggregate(pipeline).ToListAsync();

    // Mapeamos a un DTO anónimo para NO enviar IsTrue (evitar trampas en el frontend)
    var response = randomQuestions.Select(q => new
    {
        q.Id,
        q.Text,
        q.ImageUrl,
        q.Category
    });

    return Results.Ok(response);
})
.WithName("SimulateExam")
.Produces<IEnumerable<object>>(StatusCodes.Status200OK);


// POST: /api/quiz/submit
// Recibe las respuestas y calcula el resultado del lado del servidor por seguridad
app.MapPost("/api/quiz/submit", async (QuizSubmissionDto submission, IMongoDatabase db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirst("user_id")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    var questionsCollection = db.GetCollection<Question>("Questions");
    var historyCollection = db.GetCollection<QuizHistory>("ExamHistory"); // Nueva colección

    var questionIds = submission.Answers.Select(a => a.QuestionId).ToList();
    var filter = Builders<Question>.Filter.In(q => q.Id, questionIds);
    var actualQuestions = await questionsCollection.Find(filter).ToListAsync();

    int errorsCount = 0;
    var corrections = new List<CorrectionDto>();

    foreach (var userAnswer in submission.Answers)
    {
        var realQuestion = actualQuestions.FirstOrDefault(q => q.Id == userAnswer.QuestionId);

        // Si la pregunta existe y la respuesta es incorrecta
        if (realQuestion != null && realQuestion.IsTrue != userAnswer.Answer)
        {
            errorsCount++;
            corrections.Add(new CorrectionDto(
                QuestionId: realQuestion.Id,
                QuestionText: realQuestion.Text,
                CorrectAnswer: realQuestion.IsTrue,
                UserAnswer: userAnswer.Answer
            ));
        }
    }

    bool passed = errorsCount <= 3;

    // Guardar en la base de datos CON EL ID DEL USUARIO
    var historyRecord = new QuizHistory
    {
        SessionId = submission.SessionId,
        UserId = userId!, // ¡Aquí usamos el UID real de Firebase!
        ErrorsCount = errorsCount,
        Passed = passed
    };
    await db.GetCollection<QuizHistory>("ExamHistory").InsertOneAsync(historyRecord);

    return Results.Ok(new QuizResultDto(passed, errorsCount, corrections));
})
.WithName("SubmitExam")
.RequireAuthorization(); // <-- ¡ESTO PROTEGE EL ENDPOINT!

app.MapGet("/api/quiz/history", async (IMongoDatabase db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirst("user_id")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    var historyCollection = db.GetCollection<QuizHistory>("ExamHistory");

    // Buscar solo los exámenes de ESTE usuario, ordenados por fecha descendente
    var userHistory = await historyCollection
        .Find(h => h.UserId == userId)
        .SortByDescending(h => h.DateTaken)
        .ToListAsync();

    return Results.Ok(userHistory);
})
.WithName("GetUserHistory")
.RequireAuthorization(); // <-- Solo usuarios logueados

app.Run();

// DTOs auxiliares para el POST
public record QuizSubmissionDto(string SessionId, List<UserAnswerDto> Answers);
public record UserAnswerDto(string QuestionId, bool Answer);

// Actualiza el CorrectionDto
public record CorrectionDto(
    string QuestionId,
    string QuestionText,
    bool CorrectAnswer,
    bool UserAnswer
);

// Mantenemos el QuizResultDto
public record QuizResultDto(bool Passed, int ErrorsCount, List<CorrectionDto> Corrections);