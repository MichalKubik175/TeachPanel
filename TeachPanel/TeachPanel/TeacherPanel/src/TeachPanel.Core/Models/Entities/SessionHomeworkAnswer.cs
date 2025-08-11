using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Core.Models.Entities;

public sealed class SessionHomeworkAnswer : AuditEntity<Guid>
{
    private SessionHomeworkAnswer() : base(Guid.CreateVersion7()) {}

    public Guid SessionHomeworkStudentId { get; set; }
    public SessionHomeworkStudent SessionHomeworkStudent { get; set; }
    public Guid QuestionId { get; set; }
    public Question Question { get; set; }
    public SessionHomeworkAnswerState State { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }

    public static SessionHomeworkAnswer Create(Guid sessionHomeworkStudentId, Guid questionId, SessionHomeworkAnswerState state)
    {
        var answer = new SessionHomeworkAnswer
        {
            SessionHomeworkStudentId = sessionHomeworkStudentId,
            QuestionId = questionId,
            State = state,
            CreatedAtLocal = DateTimeOffset.Now
        };
        return answer;
    }

    public void Update(SessionHomeworkAnswerState state)
    {
        State = state;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
} 