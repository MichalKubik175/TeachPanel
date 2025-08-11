using TeachPanel.Application.Models.Sessions;
using TeachPanel.Application.Models.Students;

namespace TeachPanel.Application.Models.SessionRegularStudents;

public sealed class SessionRegularStudentModel
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public SessionModel? Session { get; set; }
    public Guid StudentId { get; set; }
    public StudentModel? Student { get; set; }
    public int TableNumber { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
} 