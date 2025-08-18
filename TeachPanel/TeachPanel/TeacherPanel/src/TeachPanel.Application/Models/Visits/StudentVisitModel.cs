using TeachPanel.Application.Models.Students;

namespace TeachPanel.Application.Models.Visits;

public sealed class StudentVisitModel
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public StudentModel Student { get; set; }
    public DateOnly VisitDate { get; set; }
    public bool IsPresent { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}
