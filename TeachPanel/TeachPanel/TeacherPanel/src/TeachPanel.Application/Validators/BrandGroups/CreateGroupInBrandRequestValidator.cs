using FluentValidation;
using TeachPanel.Application.Models.BrandGroups;

namespace TeachPanel.Application.Validators.BrandGroups;

public sealed class CreateGroupInBrandRequestValidator : AbstractValidator<CreateGroupInBrandRequest>
{
    public CreateGroupInBrandRequestValidator()
    {
        RuleFor(x => x.BrandId)
            .NotEmpty()
            .WithMessage("Brand ID is required");

        RuleFor(x => x.GroupName)
            .NotEmpty()
            .WithMessage("Group name is required")
            .MinimumLength(2)
            .WithMessage("Group name must be at least 2 characters long")
            .MaximumLength(100)
            .WithMessage("Group name must be less than 100 characters");
    }
} 