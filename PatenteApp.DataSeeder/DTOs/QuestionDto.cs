using System.Text.Json.Serialization;

namespace PatenteApp.DataSeeder.DTOs;

// Usiamo i record per l'immutabilità e la concisione
public record QuestionDto(
    [property: JsonPropertyName("img")] string? Img,
    [property: JsonPropertyName("q")] string Q,
    [property: JsonPropertyName("a")] bool A
);