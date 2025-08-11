using TeachPanel.Core.Models.Enums;

namespace TeachPanel.Core.Models.Entities;

public sealed class SessionRegularAnswer : AuditEntity<Guid>
{
    private SessionRegularAnswer() : base(Guid.CreateVersion7()) {}

    public Guid SessionRegularStudentId { get; set; }
    public SessionRegularStudent SessionRegularStudent { get; set; }
    public SessionRegularAnswerState State { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }

    public static SessionRegularAnswer Create(Guid sessionRegularStudentId, SessionRegularAnswerState state)
    {
        var answer = new SessionRegularAnswer
        {
            SessionRegularStudentId = sessionRegularStudentId,
            State = state,
            CreatedAtLocal = DateTimeOffset.Now
        };
        return answer;
    }

    public void Update(SessionRegularAnswerState state)
    {
        State = state;
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
} 