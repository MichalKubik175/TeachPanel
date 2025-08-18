using FluentValidation;
using TeachPanel.Application.Models.Visits;

namespace TeachPanel.Application.Validators.Visits;

public sealed class UpdateStudentVisitRequestValidator : AbstractValidator<UpdateStudentVisitRequest>
{
    public UpdateStudentVisitRequestValidator()
    {
        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notes cannot exceed 500 characters");
    }
}
