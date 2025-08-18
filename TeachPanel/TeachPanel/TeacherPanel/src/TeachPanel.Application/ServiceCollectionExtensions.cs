using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Services;

namespace TeachPanel.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IValidatorFactory, ValidatorFactory>();
        services.AddScoped<IHashingProvider, HashingProvider>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IGroupService, GroupService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<IQuestionnaireService, QuestionnaireService>();
        services.AddScoped<IQuestionService, QuestionService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<ICommentaryService, CommentaryService>();
        services.AddScoped<ITableLayoutService, TableLayoutService>();
        services.AddScoped<ISessionService, SessionService>();
        services.AddScoped<ISessionHomeworkStudentService, SessionHomeworkStudentService>();
        services.AddScoped<ISessionRegularStudentService, SessionRegularStudentService>();
        services.AddScoped<ISessionHomeworkAnswerService, SessionHomeworkAnswerService>();
        services.AddScoped<ISessionRegularAnswerService, SessionRegularAnswerService>();
        services.AddScoped<IStudentVisitService, StudentVisitService>();
        
        return services;
    }
}