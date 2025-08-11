using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Application.Models.SessionHomeworkAnswers;

public sealed class CreateSessionHomeworkAnswerRequest
{
    public Guid SessionHomeworkStudentId { get; set; }
    public Guid QuestionId { get; set; }
    public SessionHomeworkAnswerState State { get; set; }
} 