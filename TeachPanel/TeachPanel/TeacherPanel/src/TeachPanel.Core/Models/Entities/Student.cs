namespace TeachPanel.Core.Models.Entities;

public sealed class Student : AuditEntity<Guid>
{
    private Student()
        : base(Guid.CreateVersion7())
    {
    }
    
    public string FullName { get; set; }
    public Guid GroupId { get; set; }
    public Group Group { get; set; }
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }

    public static Student Create(string fullName, Guid groupId, Guid brandId, Guid userId)
    {
        var student = new Student
        {
            FullName = fullName,
            GroupId = groupId,
            BrandId = brandId,
            UserId = userId,
            CreatedAtLocal = DateTimeOffset.Now, // Local time when student is created
        };
        
        return student;
    }

    public void UpdateInfo(string fullName, Guid groupId, Guid brandId)
    {
        FullName = fullName;
        GroupId = groupId;
        BrandId = brandId;
    }
} 