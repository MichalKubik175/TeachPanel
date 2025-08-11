using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Questionnaires;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.Core.Exceptions;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Security;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class QuestionnaireService : IQuestionnaireService
{
    private readonly DatabaseContext _databaseContext;
    private readonly ISecurityContext _securityContext;

    public QuestionnaireService(DatabaseContext databaseContext, ISecurityContext securityContext)
    {
        _databaseContext = databaseContext;
        _securityContext = securityContext;
    }

    public async Task<QuestionnaireModel> CreateAsync(CreateQuestionnaireRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var questionnaire = Questionnaire.Create(request.Name, currentUserId);
        _databaseContext.Questionnaires.Add(questionnaire);
        await _databaseContext.SaveChangesAsync();

        // Add questions if provided
        if (request.Questions?.Any() == true)
        {
            foreach (var questionRequest in request.Questions)
            {
                var question = Question.Create(questionRequest.Name, questionRequest.Answer, questionnaire.Id);
                _databaseContext.Questions.Add(question);
            }
            await _databaseContext.SaveChangesAsync();
        }

        // Load questions separately to ensure they're included in the response
        var questions = await _databaseContext.Questions
            .Where(q => q.QuestionnaireId == questionnaire.Id && !q.IsDeleted)
            .ToListAsync();

        // Manually set the questions collection
        questionnaire.Questions = questions;

        return questionnaire.ToQuestionnaireModel();
    }

    public async Task<QuestionnaireModel> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var questionnaire = await _databaseContext.Questionnaires
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId && !x.IsDeleted);

        if (questionnaire == null)
        {
            throw new ResourceNotFoundException($"Questionnaire with ID {id}");
        }

        // Load questions separately to ensure proper filtering
        var questions = await _databaseContext.Questions
            .Where(q => q.QuestionnaireId == id && !q.IsDeleted)
            .ToListAsync();

        // Manually set the questions collection
        questionnaire.Questions = questions;

        return questionnaire.ToQuestionnaireModel();
    }

    public async Task<PagingResponse<QuestionnaireModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<Questionnaire>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _databaseContext.Questionnaires
            .Where(x => x.UserId == currentUserId && !x.IsDeleted)
            .AsQueryable();

        var page = await pageFilter.ApplyToQueryable(query);
        
        // Load questions separately for each questionnaire
        var questionnaireIds = page.Items.Select(x => x.Id).ToList();
        var allQuestions = await _databaseContext.Questions
            .Where(q => questionnaireIds.Contains(q.QuestionnaireId) && !q.IsDeleted)
            .ToListAsync();

        // Group questions by questionnaire ID
        var questionsByQuestionnaire = allQuestions.GroupBy(q => q.QuestionnaireId)
            .ToDictionary(g => g.Key, g => g.ToList());

        // Assign questions to each questionnaire
        foreach (var questionnaire in page.Items)
        {
            if (questionsByQuestionnaire.TryGetValue(questionnaire.Id, out var questions))
            {
                questionnaire.Questions = questions;
            }
        }

        var questionnaires = page.Items.Select(x => x.ToQuestionnaireModel()).ToArray();

        return new PagingResponse<QuestionnaireModel>
        {
            Items = questionnaires,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<QuestionnaireModel> UpdateAsync(Guid id, UpdateQuestionnaireRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var questionnaire = await _databaseContext.Questionnaires
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId && !x.IsDeleted);

        if (questionnaire == null)
        {
            throw new ResourceNotFoundException($"Questionnaire with ID {id}");
        }

        questionnaire.UpdateInfo(request.Name);
        await _databaseContext.SaveChangesAsync();

        return questionnaire.ToQuestionnaireModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var questionnaire = await _databaseContext.Questionnaires
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId && !x.IsDeleted);

        if (questionnaire == null)
        {
            throw new ResourceNotFoundException($"Questionnaire with ID {id}");
        }

        questionnaire.MarkAsDeleted();
        await _databaseContext.SaveChangesAsync();
    }
} 