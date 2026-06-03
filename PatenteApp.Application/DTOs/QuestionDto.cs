namespace PatenteApp.Application.DTOs;

public record QuestionDto(string Id, string Text, string? ImageUrl, string Category);
public record UserAnswerDto(string QuestionId, bool Answer);
public record QuizSubmissionDto(string SessionId, List<UserAnswerDto> Answers);
public record CorrectionDto(string QuestionId, bool CorrectAnswer, string? Explanation);
public record QuizResultDto(bool Passed, int ErrorsCount, List<CorrectionDto> Corrections);