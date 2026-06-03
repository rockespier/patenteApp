using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PatenteApp.Domain.Entities;

public class QuizHistory
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; init; } = ObjectId.GenerateNewId().ToString();

    public required string SessionId { get; init; }

    // Trade-off: Por ahora es anónimo. En el futuro aquí iría un UserId (ej. de Azure AD B2C)
    public string UserId { get; init; } = "anonymous_user";

    public DateTime DateTaken { get; init; } = DateTime.UtcNow;
    public required int ErrorsCount { get; init; }
    public required bool Passed { get; init; }
}