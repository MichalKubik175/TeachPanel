namespace TeachPanel.Application.Models.Commentaries;

public sealed class CommentaryModel
{
    public Guid Id { get; set; }
    public string Text { get; set; }
    public DateTimeOffset CreatedAtLocal { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
} 