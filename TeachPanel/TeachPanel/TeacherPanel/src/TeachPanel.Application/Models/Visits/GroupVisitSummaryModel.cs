using TeachPanel.Application.Models.Groups;

namespace TeachPanel.Application.Models.Visits;

public sealed class GroupVisitSummaryModel
{
    public Guid GroupId { get; set; }
    public GroupModel Group { get; set; }
    public DateOnly VisitDate { get; set; }
    public int TotalStudents { get; set; }
    public int PresentStudents { get; set; }
    public int AbsentStudents { get; set; }
    public double AttendancePercentage { get; set; }
    public List<StudentVisitModel> StudentVisits { get; set; } = new();
}
