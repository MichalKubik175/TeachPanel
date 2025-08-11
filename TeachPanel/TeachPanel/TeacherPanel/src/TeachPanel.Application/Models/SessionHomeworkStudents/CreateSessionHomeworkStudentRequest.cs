namespace TeachPanel.Application.Models.SessionHomeworkStudents;

public sealed class CreateSessionHomeworkStudentRequest
{
    public Guid SessionId { get; set; }
    public Guid StudentId { get; set; }
    public int TableNumber { get; set; }
} 