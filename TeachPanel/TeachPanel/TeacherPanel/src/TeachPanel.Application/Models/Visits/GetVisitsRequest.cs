using TeachPanel.Application.Models.Common;

namespace TeachPanel.Application.Models.Visits;

public sealed class GetVisitsRequest : PagingRequest
{
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public Guid? GroupId { get; set; }
    public Guid? StudentId { get; set; }
    public bool? IsPresent { get; set; }
}
