namespace TeachPanel.Application.Models.SessionRegularStudents;

public sealed class CreateSessionRegularStudentRequest
{
    public Guid SessionId { get; set; }
    public Guid StudentId { get; set; }
    public int TableNumber { get; set; }
} 