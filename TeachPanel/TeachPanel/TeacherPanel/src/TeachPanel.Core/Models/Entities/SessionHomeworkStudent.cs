namespace TeachPanel.Core.Models.Entities;

public sealed class SessionHomeworkStudent : AuditEntity<Guid>
{
    private SessionHomeworkStudent()
        : base(Guid.CreateVersion7())
    {
    }
    
    public Guid SessionId { get; set; }
    public Session Session { get; set; }
    public Guid StudentId { get; set; }
    public Student Student { get; set; }
    public int TableNumber { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }

    public static SessionHomeworkStudent Create(Guid sessionId, Guid studentId, int tableNumber, Guid userId)
    {
        var sessionHomeworkStudent = new SessionHomeworkStudent
        {
            SessionId = sessionId,
            StudentId = studentId,
            TableNumber = tableNumber,
            UserId = userId,
            CreatedAtLocal = DateTimeOffset.Now
        };
        
        return sessionHomeworkStudent;
    }

    public void Update(int tableNumber)
    {
        TableNumber = tableNumber;
    }
} 