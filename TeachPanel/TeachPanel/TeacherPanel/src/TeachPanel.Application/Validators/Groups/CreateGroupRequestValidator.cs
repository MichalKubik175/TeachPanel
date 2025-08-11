using FluentValidation;
using TeachPanel.Application.Models.Groups;

namespace TeachPanel.Application.Validators.Groups;

public sealed class CreateGroupRequestValidator : AbstractValidator<CreateGroupRequest>
{
    public CreateGroupRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .WithMessage("Group name is required and must not exceed 100 characters");
    }
} 