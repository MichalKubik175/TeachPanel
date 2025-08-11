using TeachPanel.Application.Models.Brands;
using TeachPanel.Application.Models.Groups;

namespace TeachPanel.Application.Models.BrandGroups;

public sealed class BrandGroupModel
{
    public Guid Id { get; set; }
    public Guid BrandId { get; set; }
    public BrandModel Brand { get; set; }
    public Guid GroupId { get; set; }
    public GroupModel Group { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
} 