using TeachPanel.Application.Models.Brands;

namespace TeachPanel.Application.Models.Groups;

public sealed class GroupModel
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public BrandModel? Brand { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
} 