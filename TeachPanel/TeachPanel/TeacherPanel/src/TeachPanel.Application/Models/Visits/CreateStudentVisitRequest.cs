namespace TeachPanel.Application.Models.Visits;

public sealed class CreateStudentVisitRequest
{
    public Guid StudentId { get; set; }
    public DateOnly VisitDate { get; set; }
    public bool IsPresent { get; set; }
    public string? Notes { get; set; }
}
