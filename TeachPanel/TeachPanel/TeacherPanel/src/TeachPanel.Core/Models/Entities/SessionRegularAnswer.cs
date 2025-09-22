using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Core.Models.Entities;

public sealed class SessionRegularAnswer : AuditEntity<Guid>
{
    private SessionRegularAnswer() : base(Guid.CreateVersion7()) {}

    public Guid SessionRegularStudentId { get; set; }
    public SessionRegularStudent SessionRegularStudent { get; set; }
    public int QuestionNumber { get; set; }
    public SessionRegularAnswerState State { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }

    public static SessionRegularAnswer Create(Guid sessionRegularStudentId, int questionNumber, SessionRegularAnswerState state)
    {
        var answer = new SessionRegularAnswer
        {
            SessionRegularStudentId = sessionRegularStudentId,
            QuestionNumber = questionNumber,
            State = state,
            CreatedAtLocal = DateTimeOffset.Now
        };
        return answer;
    }

    public void Update(int questionNumber, SessionRegularAnswerState state)
    {
        QuestionNumber = questionNumber;
        State = state;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
} 