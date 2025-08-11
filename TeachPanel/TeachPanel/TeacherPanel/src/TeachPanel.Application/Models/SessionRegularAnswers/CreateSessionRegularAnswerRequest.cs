using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.SessionRegularAnswers;

public sealed class CreateSessionRegularAnswerRequest
{
    public Guid SessionRegularStudentId { get; set; }
    public SessionRegularAnswerState State { get; set; }
} 