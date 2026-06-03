using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PatenteApp.Api.Infrastructure.Settings;
using PatenteApp.Domain.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración fuertemente tipada (Options Pattern)
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// 2. Configurar CORS desde appsettings
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy => policy.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 3. Inyección de Dependencias: MongoDB
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return client.GetDatabase(settings.DatabaseName);
});

// 4. Firebase Auth — leer Project ID desde configuración
var firebaseProjectId = builder.Configuration["Firebase:ProjectId"]
    ?? throw new InvalidOperationException("Firebase:ProjectId no está configurado.");

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

app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();


// --- ENDPOINTS ---

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/api/questions/simulate", async (IMongoDatabase db) =>
{
    var collection = db.GetCollection<Question>("Questions");
    var pipeline = new EmptyPipelineDefinition<Question>().Sample(30);
    var randomQuestions = await collection.Aggregate(pipeline).ToListAsync();

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


app.MapPost("/api/quiz/submit", async (QuizSubmissionDto submission, IMongoDatabase db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirst("user_id")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    var questionsCollection = db.GetCollection<Question>("Questions");
    var historyCollection = db.GetCollection<QuizHistory>("ExamHistory");

    var questionIds = submission.Answers.Select(a => a.QuestionId).ToList();
    var filter = Builders<Question>.Filter.In(q => q.Id, questionIds);
    var actualQuestions = await questionsCollection.Find(filter).ToListAsync();

    int errorsCount = 0;
    var corrections = new List<CorrectionDto>();

    foreach (var userAnswer in submission.Answers)
    {
        var realQuestion = actualQuestions.FirstOrDefault(q => q.Id == userAnswer.QuestionId);

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

    var historyRecord = new QuizHistory
    {
        SessionId = submission.SessionId,
        UserId = userId!,
        ErrorsCount = errorsCount,
        Passed = passed
    };
    await db.GetCollection<QuizHistory>("ExamHistory").InsertOneAsync(historyRecord);

    return Results.Ok(new QuizResultDto(passed, errorsCount, corrections));
})
.WithName("SubmitExam")
.RequireAuthorization();

app.MapGet("/api/quiz/history", async (IMongoDatabase db, ClaimsPrincipal user) =>
{
    var userId = user.FindFirst("user_id")?.Value ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    var historyCollection = db.GetCollection<QuizHistory>("ExamHistory");

    var userHistory = await historyCollection
        .Find(h => h.UserId == userId)
        .SortByDescending(h => h.DateTaken)
        .ToListAsync();

    return Results.Ok(userHistory);
})
.WithName("GetUserHistory")
.RequireAuthorization();

app.Run();

public record QuizSubmissionDto(string SessionId, List<UserAnswerDto> Answers);
public record UserAnswerDto(string QuestionId, bool Answer);

public record CorrectionDto(
    string QuestionId,
    string QuestionText,
    bool CorrectAnswer,
    bool UserAnswer
);

public record QuizResultDto(bool Passed, int ErrorsCount, List<CorrectionDto> Corrections);
