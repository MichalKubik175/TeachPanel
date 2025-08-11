namespace TeachPanel.Application.Models.Brands;

public sealed class BrandModel
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
} 