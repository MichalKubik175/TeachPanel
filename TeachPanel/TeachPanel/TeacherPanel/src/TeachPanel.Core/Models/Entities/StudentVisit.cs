namespace TeachPanel.Core.Models.Entities;

public sealed class StudentVisit : AuditEntity<Guid>
{
    private StudentVisit()
        : base(Guid.CreateVersion7())
    {
    }
    
    public Guid StudentId { get; set; }
    public Student Student { get; set; }
    public DateOnly VisitDate { get; set; }
    public bool IsPresent { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; }
    public string? Notes { get; set; }

    public static StudentVisit Create(Guid studentId, DateOnly visitDate, bool isPresent, Guid userId, string? notes = null)
    {
        var visit = new StudentVisit
        {
            StudentId = studentId,
            VisitDate = visitDate,
            IsPresent = isPresent,
            UserId = userId,
            Notes = notes
        };
        
        return visit;
    }

    public void UpdateVisitStatus(bool isPresent, string? notes = null)
    {
        IsPresent = isPresent;
        Notes = notes;
    }
}

