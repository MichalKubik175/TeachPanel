namespace TeachPanel.Core.Models.Entities;

public sealed class Brand : AuditEntity<Guid>
{
    private Brand()
        : base(Guid.CreateVersion7())
    {
    }
    
    public string Name { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }

    public static Brand Create(string name, Guid userId)
    {
        var brand = new Brand
        {
            Name = name,
            UserId = userId,
            CreatedAtLocal = DateTimeOffset.Now,
        };
        
        return brand;
    }

    public void UpdateName(string newName)
    {
        Name = newName;
    }
} 