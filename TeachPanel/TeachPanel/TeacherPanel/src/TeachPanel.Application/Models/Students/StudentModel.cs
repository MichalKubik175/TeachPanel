using TeachPanel.Application.Models.Groups;

namespace TeachPanel.Application.Models.Students;

public sealed class StudentModel
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public Guid GroupId { get; set; }
    public GroupModel Group { get; set; }
    public int HomeworkScore { get; set; }
    public int RegularScore { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
} 