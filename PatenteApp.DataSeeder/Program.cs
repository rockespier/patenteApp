using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Driver;
using PatenteApp.Domain.Entities;
using PatenteApp.DataSeeder.DTOs;

Console.WriteLine("Avvio migrazione dati da JSON GitHub a MongoDB Atlas...");

// 1. Configurazione MongoDB
const string connectionString = "mongodb+srv://admin_patente:rokQG11sNJbec75I@cluster0.7pnq2lh.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";
var client = new MongoClient(connectionString);
var database = client.GetDatabase("PatenteDB");
var collection = database.GetCollection<Question>("Questions");

// 2. Lettura del file JSON
string jsonFilePath = @"C:\r3websolutions\Documentazione\Curso\Demo\QuizPatenteB-main\QuizPatenteB-main\quizPatenteB2023.json";
string jsonContent = await File.ReadAllTextAsync(jsonFilePath);

// 3. Deserializzazione Avanzata (Gestione Dizionario Annidato)
var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
var githubData = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, List<QuestionDto>>>>(jsonContent, options);

var questionsToInsert = new List<Question>();

if (githubData != null)
{
    // Categoria Principale (es. "definizioni-generali-doveri-strada")
    foreach (var macroCategory in githubData)
    {
        // Pulizia nome categoria (es. "Definizioni generali doveri strada")
        string categoryName = macroCategory.Key.Replace("-", " ").ToUpperInvariant();

        // Sotto-categoria (es. "carreggiata-doppio-senso")
        foreach (var subCategory in macroCategory.Value)
        {
            string subCategoryName = subCategory.Key.Replace("-", " ");

            // Le singole domande
            foreach (var qDto in subCategory.Value)
            {
                questionsToInsert.Add(new Question
                {
                    Id = ObjectId.GenerateNewId().ToString(), // ID Nativo di Mongo
                    Text = qDto.Q,
                    IsTrue = qDto.A,
                    // Il JSON ha percorsi come "/img_sign/550.png". Lo teniamo così.
                    ImageUrl = qDto.Img,
                    // Salviamo la categoria unendo macro e sotto-categoria
                    Category = $"{categoryName} - {subCategoryName}",
                    Explanation = null // Il JSON GitHub purtroppo non ha le spiegazioni
                });
            }
        }
    }
}

// 4. Inserimento massivo (Bulk Insert) in MongoDB
if (questionsToInsert.Any())
{
    // Opcionale: Svuota la collezione prima di ricaricare (utile in fase di test)
    await collection.DeleteManyAsync(Builders<Question>.Filter.Empty);

    Console.WriteLine($"Inserimento di {questionsToInsert.Count} domande in corso...");
    await collection.InsertManyAsync(questionsToInsert);
    Console.WriteLine("Migrazione completata con successo!");
}
else
{
    Console.WriteLine("Nessun dato trovato o errore di parsing del JSON.");
}