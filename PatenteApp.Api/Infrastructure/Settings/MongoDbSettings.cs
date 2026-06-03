// Infrastructure/Settings/MongoDbSettings.cs
namespace PatenteApp.Api.Infrastructure.Settings;

public class MongoDbSettings
{
    public required string ConnectionString { get; init; }
    public required string DatabaseName { get; init; }
    public required string QuestionsCollectionName { get; init; }
}