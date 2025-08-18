using FluentValidation;
using TeachPanel.Application.Models.Visits;

namespace TeachPanel.Application.Validators.Visits;

public sealed class CreateStudentVisitRequestValidator : AbstractValidator<CreateStudentVisitRequest>
{
    public CreateStudentVisitRequestValidator()
    {
        RuleFor(x => x.StudentId)
            .NotEmpty()
            .WithMessage("Student ID is required");

        RuleFor(x => x.VisitDate)
            .NotEmpty()
            .WithMessage("Visit date is required")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now.AddDays(1)))
            .WithMessage("Visit date cannot be in the future");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notes cannot exceed 500 characters");
    }
}
