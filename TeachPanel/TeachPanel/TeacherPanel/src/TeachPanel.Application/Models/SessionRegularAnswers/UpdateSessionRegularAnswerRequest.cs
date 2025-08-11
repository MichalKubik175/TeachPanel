using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.SessionRegularAnswers;

public sealed class UpdateSessionRegularAnswerRequest
{
    public SessionRegularAnswerState State { get; set; }
} 