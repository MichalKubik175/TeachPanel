namespace TeachPanel.Core.Models.Entities;

public sealed class Group : AuditEntity<Guid>
{
    private Group()
        : base(Guid.CreateVersion7())
    {
    }
    
    public string Name { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }
    
    public ICollection<Student> Students { get; set; } = new List<Student>();

    public static Group Create(string name, Guid userId)
    {
        var group = new Group
        {
            Name = name,
            UserId = userId,
        };
        
        return group;
    }

    public void UpdateName(string newName)
    {
        Name = newName;
    }
} 