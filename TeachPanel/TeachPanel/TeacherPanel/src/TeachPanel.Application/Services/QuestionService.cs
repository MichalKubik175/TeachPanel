using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Questions;
using TeachPanel.Application.Security;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.Core.Exceptions;
using TeachPanel.Application.Mapping;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class QuestionService : IQuestionService
{
    private readonly DatabaseContext _databaseContext;
    private readonly ISecurityContext _securityContext;

    public QuestionService(DatabaseContext databaseContext, ISecurityContext securityContext)
    {
        _databaseContext = databaseContext;
        _securityContext = securityContext;
    }

    public async Task<QuestionModel> CreateAsync(CreateQuestionRequest request, Guid questionnaireId)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        
        // Verify questionnaire exists and belongs to current user
        var questionnaire = await _databaseContext.Questionnaires
            .FirstOrDefaultAsync(x => x.Id == questionnaireId && x.UserId == currentUserId && !x.IsDeleted);

        if (questionnaire == null)
        {
            throw new ResourceNotFoundException($"Questionnaire with ID {questionnaireId}");
        }

        var question = Question.Create(request.Name, request.Answer, questionnaireId);
        _databaseContext.Questions.Add(question);
        await _databaseContext.SaveChangesAsync();

        return question.ToQuestionModel();
    }

    public async Task<QuestionModel> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var question = await _databaseContext.Questions
            .Include(x => x.Questionnaire)
            .FirstOrDefaultAsync(x => x.Id == id && x.Questionnaire.UserId == currentUserId && !x.IsDeleted);

        if (question == null)
        {
            throw new ResourceNotFoundException($"Question with ID {id}");
        }

        return question.ToQuestionModel();
    }

    public async Task<PagingResponse<QuestionModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<Question>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _databaseContext.Questions
            .Include(x => x.Questionnaire)
            .Where(x => x.Questionnaire.UserId == currentUserId && !x.IsDeleted)
            .AsQueryable();

        var page = await pageFilter.ApplyToQueryable(query);
        var questions = page.Items.Select(x => x.ToQuestionModel()).ToArray();

        return new PagingResponse<QuestionModel>
        {
            Items = questions,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<PagingResponse<QuestionModel>> GetByQuestionnaireIdAsync(Guid questionnaireId, PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var query = _databaseContext.Questions
            .Include(x => x.Questionnaire)
            .Where(x => x.QuestionnaireId == questionnaireId && x.Questionnaire.UserId == currentUserId && !x.IsDeleted)
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => x.ToQuestionModel())
            .ToListAsync();

        return new PagingResponse<QuestionModel>
        {
            Items = items,
            Meta = new PageMetadataModel(
                totalCount == 0 ? 1 : (int)Math.Ceiling((double)totalCount / request.PageSize),
                request.Page,
                totalCount
            )
        };
    }

    public async Task<QuestionModel> UpdateAsync(Guid id, UpdateQuestionRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var question = await _databaseContext.Questions
            .Include(x => x.Questionnaire)
            .FirstOrDefaultAsync(x => x.Id == id && x.Questionnaire.UserId == currentUserId && !x.IsDeleted);

        if (question == null)
        {
            throw new ResourceNotFoundException($"Question with ID {id}");
        }

        question.UpdateInfo(request.Name, request.Answer);
        await _databaseContext.SaveChangesAsync();

        return question.ToQuestionModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var question = await _databaseContext.Questions
            .Include(x => x.Questionnaire)
            .FirstOrDefaultAsync(x => x.Id == id && x.Questionnaire.UserId == currentUserId && !x.IsDeleted);

        if (question == null)
        {
            throw new ResourceNotFoundException($"Question with ID {id}");
        }

        question.MarkAsDeleted();
        await _databaseContext.SaveChangesAsync();
    }
} 