namespace TeachPanel.Application.Models.BrandGroups;

public sealed class CreateGroupInBrandRequest
{
    public Guid BrandId { get; set; }
    public string GroupName { get; set; }
} 