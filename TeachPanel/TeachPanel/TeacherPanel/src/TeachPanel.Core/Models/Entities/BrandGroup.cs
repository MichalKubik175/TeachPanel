namespace TeachPanel.Core.Models.Entities;

public sealed class BrandGroup : AuditEntity<Guid>
{
    private BrandGroup()
        : base(Guid.CreateVersion7())
    {
    }
    
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; }
    
    public Guid GroupId { get; set; }
    public Group Group { get; set; }
    
    public DateTimeOffset CreatedAtLocal { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }

    public static BrandGroup Create(Guid brandId, Guid groupId, Guid userId)
    {
        var brandGroup = new BrandGroup
        {
            BrandId = brandId,
            GroupId = groupId,
            UserId = userId,
            CreatedAtLocal = DateTimeOffset.Now,
        };
        
        return brandGroup;
    }

    public void UpdateBrandGroup(Guid brandId, Guid groupId)
    {
        BrandId = brandId;
        GroupId = groupId;
    }
} 