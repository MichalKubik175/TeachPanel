using FluentValidation;
using TeachPanel.Application.Models.Students;

namespace TeachPanel.Application.Validators.Students;

public sealed class CreateStudentRequestValidator : AbstractValidator<CreateStudentRequest>
{
    public CreateStudentRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(200)
            .WithMessage("Full name is required and must not exceed 200 characters");

        RuleFor(x => x.BrandId)
            .NotEmpty()
            .WithMessage("Brand ID is required");

        RuleFor(x => x.GroupId)
            .NotEmpty()
            .WithMessage("Group ID is required");
    }
} 