namespace TeachPanel.Core.Models.Entities;

public sealed class Commentary : AuditEntity<Guid>
{
    private Commentary()
        : base(Guid.CreateVersion7())
    {
    }
    
    public string Text { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }

    public static Commentary Create(string text, Guid userId)
    {
        var commentary = new Commentary
        {
            Text = text,
            UserId = userId,
            CreatedAtLocal = DateTimeOffset.Now,
        };
        
        return commentary;
    }

    public void UpdateText(string newText)
    {
        Text = newText;
    }
} 