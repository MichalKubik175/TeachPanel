using FluentValidation;
using TeachPanel.Application.Models.Questions;

namespace TeachPanel.Application.Validators.Questions;

public sealed class CreateQuestionRequestValidator : AbstractValidator<CreateQuestionRequest>
{
    public CreateQuestionRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(500)
            .WithMessage("Name is required and must not exceed 500 characters");

        RuleFor(x => x.Answer)
            .NotEmpty()
            .MaximumLength(1000)
            .WithMessage("Answer is required and must not exceed 1000 characters");


    }
} 