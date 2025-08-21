using FluentValidation;
using TeachPanel.Application.Models.Visits;

namespace TeachPanel.Application.Validators.Visits;

public sealed class BulkVisitRequestValidator : AbstractValidator<BulkVisitRequest>
{
    public BulkVisitRequestValidator()
    {
        RuleFor(x => x.VisitDate)
            .NotEmpty()
            .WithMessage("Visit date is required")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now.AddDays(1)))
            .WithMessage("Visit date cannot be in the future");

        RuleFor(x => x)
            .Must(x => x.GroupId.HasValue || (x.StudentIds?.Any() == true))
            .WithMessage("Either GroupId or StudentIds must be provided");

        RuleFor(x => x.StudentIds)
            .Must(x => x == null || x.Count <= 100)
            .WithMessage("Cannot process more than 100 students at once");

        RuleFor(x => x.ExcludedStudentIds)
            .Must(x => x == null || x.Count <= 100)
            .WithMessage("Cannot exclude more than 100 students at once");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notes cannot exceed 500 characters");
    }
}

