using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionHomeworkAnswers;
using TeachPanel.Application.Security;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class SessionHomeworkAnswerService : ISessionHomeworkAnswerService
{
    private readonly DatabaseContext _context;
    private readonly ISecurityContext _securityContext;

    public SessionHomeworkAnswerService(DatabaseContext context, ISecurityContext securityContext)
    {
        _context = context;
        _securityContext = securityContext;
    }

    public async Task<SessionHomeworkAnswerModel> CreateAsync(CreateSessionHomeworkAnswerRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        
        var shs = await _context.SessionHomeworkStudents
            .FirstOrDefaultAsync(s => s.Id == request.SessionHomeworkStudentId && s.UserId == currentUserId);
        if (shs is null)
            throw new ResourceNotFoundException($"SessionHomeworkStudent with id {request.SessionHomeworkStudentId} not found");

        var question = await _context.Questions
            .Include(q => q.Questionnaire)
            .FirstOrDefaultAsync(q => q.Id == request.QuestionId && q.Questionnaire.UserId == currentUserId && !q.IsDeleted);
        if (question is null)
            throw new ResourceNotFoundException($"Question with id {request.QuestionId} not found");

        var answer = SessionHomeworkAnswer.Create(request.SessionHomeworkStudentId, request.QuestionId, request.State);
        _context.SessionHomeworkAnswers.Add(answer);
        await _context.SaveChangesAsync();
        return answer.ToSessionHomeworkAnswerModel();
    }

    public async Task<SessionHomeworkAnswerModel?> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var answer = await _context.SessionHomeworkAnswers
            .Include(a => a.SessionHomeworkStudent)
            .Include(a => a.Question)
            .FirstOrDefaultAsync(a => a.Id == id && a.SessionHomeworkStudent.UserId == currentUserId);
        return answer?.ToSessionHomeworkAnswerModel();
    }

    public async Task<PagingResponse<SessionHomeworkAnswerModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<SessionHomeworkAnswer>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };
        var query = _context.SessionHomeworkAnswers
            .Include(a => a.SessionHomeworkStudent)
            .Include(a => a.Question)
            .Where(a => a.SessionHomeworkStudent.UserId == currentUserId)
            .AsQueryable();
        var page = await pageFilter.ApplyToQueryable(query);
        var answers = page.Items.Select(x => x.ToSessionHomeworkAnswerModel()).ToArray();
        return new PagingResponse<SessionHomeworkAnswerModel>
        {
            Items = answers,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<SessionHomeworkAnswerModel> UpdateAsync(Guid id, UpdateSessionHomeworkAnswerRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var answer = await _context.SessionHomeworkAnswers
            .Include(a => a.SessionHomeworkStudent)
            .FirstOrDefaultAsync(a => a.Id == id && a.SessionHomeworkStudent.UserId == currentUserId);
        if (answer == null)
            throw new ResourceNotFoundException($"SessionHomeworkAnswer with id {id} not found");
        answer.Update(request.State);
        await _context.SaveChangesAsync();
        return answer.ToSessionHomeworkAnswerModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var answer = await _context.SessionHomeworkAnswers
            .Include(a => a.SessionHomeworkStudent)
            .FirstOrDefaultAsync(a => a.Id == id && a.SessionHomeworkStudent.UserId == currentUserId);
        if (answer == null)
            throw new ResourceNotFoundException($"SessionHomeworkAnswer with id {id} not found");
        _context.SessionHomeworkAnswers.Remove(answer);
        await _context.SaveChangesAsync();
    }
} 