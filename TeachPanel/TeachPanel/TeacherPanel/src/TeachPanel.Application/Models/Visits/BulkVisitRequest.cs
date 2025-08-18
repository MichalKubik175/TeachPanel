namespace TeachPanel.Application.Models.Visits;

public sealed class BulkVisitRequest
{
    public DateOnly VisitDate { get; set; }
    public bool IsPresent { get; set; }
    public Guid? GroupId { get; set; }
    public List<Guid>? StudentIds { get; set; }
    public List<Guid>? ExcludedStudentIds { get; set; }
    public string? Notes { get; set; }
}
