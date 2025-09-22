using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.SessionRegularAnswers;

public sealed class UpdateSessionRegularAnswerRequest
{
    public int QuestionNumber { get; set; }
    public SessionRegularAnswerState State { get; set; }
} 