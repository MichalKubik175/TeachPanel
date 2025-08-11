using FluentValidation;
using TeachPanel.Application.Models.Questionnaires;

namespace TeachPanel.Application.Validators.Questionnaires;

public sealed class CreateQuestionnaireRequestValidator : AbstractValidator<CreateQuestionnaireRequest>
{
    public CreateQuestionnaireRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200)
            .WithMessage("Name is required and must not exceed 200 characters");
    }
} 