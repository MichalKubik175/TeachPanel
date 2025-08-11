namespace TeachPanel.Application.Models.Students;

public sealed class UpdateStudentRequest
{
    public string FullName { get; set; }
    public Guid BrandId { get; set; }
    public Guid GroupId { get; set; }
} 