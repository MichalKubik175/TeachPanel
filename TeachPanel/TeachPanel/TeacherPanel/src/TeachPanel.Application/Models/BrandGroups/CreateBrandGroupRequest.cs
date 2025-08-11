namespace TeachPanel.Application.Models.BrandGroups;

public sealed class CreateBrandGroupRequest
{
    public Guid BrandId { get; set; }
    public Guid GroupId { get; set; }
} 