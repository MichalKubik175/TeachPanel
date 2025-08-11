using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.SessionHomeworkAnswers;

public sealed class UpdateSessionHomeworkAnswerRequest
{
    public SessionHomeworkAnswerState State { get; set; }
} 