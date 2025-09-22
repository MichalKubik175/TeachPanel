using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionRegularAnswers;
using TeachPanel.Application.Security;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class SessionRegularAnswerService : ISessionRegularAnswerService
{
    private readonly DatabaseContext _context;
    private readonly ISecurityContext _securityContext;

    public SessionRegularAnswerService(DatabaseContext context, ISecurityContext securityContext)
    {
        _context = context;
        _securityContext = securityContext;
    }

    public async Task<SessionRegularAnswerModel> CreateAsync(CreateSessionRegularAnswerRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        
        var srs = await _context.SessionRegularStudents
            .FirstOrDefaultAsync(s => s.Id == request.SessionRegularStudentId && s.UserId == currentUserId);
        if (srs is null)
            throw new ResourceNotFoundException($"SessionRegularStudent with id {request.SessionRegularStudentId} not found");

        var answer = SessionRegularAnswer.Create(request.SessionRegularStudentId, request.QuestionNumber, request.State);
        _context.SessionRegularAnswers.Add(answer);
        await _context.SaveChangesAsync();
        return answer.ToSessionRegularAnswerModel();
    }

    public async Task<SessionRegularAnswerModel?> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var answer = await _context.SessionRegularAnswers
            .Include(a => a.SessionRegularStudent)
            .FirstOrDefaultAsync(a => a.Id == id && a.SessionRegularStudent.UserId == currentUserId);
        return answer?.ToSessionRegularAnswerModel();
    }

    public async Task<PagingResponse<SessionRegularAnswerModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<SessionRegularAnswer>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };
        var query = _context.SessionRegularAnswers
            .Include(a => a.SessionRegularStudent)
            .Where(a => a.SessionRegularStudent.UserId == currentUserId)
            .AsQueryable();
        var page = await pageFilter.ApplyToQueryable(query);
        var answers = page.Items.Select(x => x.ToSessionRegularAnswerModel()).ToArray();
        return new PagingResponse<SessionRegularAnswerModel>
        {
            Items = answers,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<SessionRegularAnswerModel> UpdateAsync(Guid id, UpdateSessionRegularAnswerRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var answer = await _context.SessionRegularAnswers
            .Include(a => a.SessionRegularStudent)
            .FirstOrDefaultAsync(a => a.Id == id && a.SessionRegularStudent.UserId == currentUserId);
        if (answer == null)
            throw new ResourceNotFoundException($"SessionRegularAnswer with id {id} not found");
        answer.Update(request.QuestionNumber, request.State);
        await _context.SaveChangesAsync();
        return answer.ToSessionRegularAnswerModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var answer = await _context.SessionRegularAnswers
            .Include(a => a.SessionRegularStudent)
            .FirstOrDefaultAsync(a => a.Id == id && a.SessionRegularStudent.UserId == currentUserId);
        if (answer == null)
            throw new ResourceNotFoundException($"SessionRegularAnswer with id {id} not found");
        _context.SessionRegularAnswers.Remove(answer);
        await _context.SaveChangesAsync();
    }
} 