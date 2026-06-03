using PatenteApp.Application.DTOs;

namespace PatenteApp.Application.Services;

public interface IExamService
{
    Task<IEnumerable<QuestionDto>> GenerateSimulationAsync();
    Task<QuizResultDto> EvaluateSubmissionAsync(QuizSubmissionDto submission);
}