namespace PatenteApp.Domain.Entities;

// Entidad Principal: Pregunta
public class Question
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string Text { get; init; }
    public string? ImageUrl { get; init; }
    public required bool IsTrue { get; init; }
    public required string Category { get; init; }
    public string? Explanation { get; init; }
}

// Agregado: Sesión de Quiz
public class QuizSession
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public DateTime StartTime { get; init; } = DateTime.UtcNow;
    public List<QuizAnswer> Answers { get; private set; } = [];
    public bool IsCompleted { get; private set; }
    public int Score { get; private set; }

    public void CompleteSession(int errorsCount)
    {
        IsCompleted = true;
        Score = errorsCount;
    }
}

// Value Object: Respuesta del usuario
public record QuizAnswer(string QuestionId, bool SelectedAnswer);

// Interfaces de Repositorio (Inversión de Dependencias)
public interface IQuestionRepository
{
    Task<IEnumerable<Question>> GetRandomQuestionsAsync(int count = 30);
    Task<IEnumerable<Question>> GetQuestionsByIdsAsync(IEnumerable<string> ids);
}