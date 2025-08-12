using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Sessions;
using TeachPanel.Application.Security;
using TeachPanel.Application.Validators;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class SessionService : ISessionService
{
    private readonly DatabaseContext _context;
    private readonly ISecurityContext _securityContext;
    private readonly IValidatorFactory _validatorFactory;

    public SessionService(DatabaseContext context, ISecurityContext securityContext, IValidatorFactory validatorFactory)
    {
        _context = context;
        _securityContext = securityContext;
        _validatorFactory = validatorFactory;
    }

    public async Task<SessionModel> CreateAsync(CreateSessionRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();

        // Validate TableLayout belongs to current user
        var tableLayout = await _context.TableLayouts
            .FirstOrDefaultAsync(tl => tl.Id == request.TableLayoutId && tl.UserId == currentUserId);
        
        if (tableLayout == null)
        {
            throw new ResourceNotFoundException($"Table layout with ID {request.TableLayoutId} not found");
        }

        // Validate Questionnaire belongs to current user (if provided)
        if (request.QuestionnaireId.HasValue)
        {
            var questionnaire = await _context.Questionnaires
                .FirstOrDefaultAsync(q => q.Id == request.QuestionnaireId.Value && q.UserId == currentUserId && !q.IsDeleted);
            
            if (questionnaire == null)
            {
                throw new ResourceNotFoundException($"Questionnaire with ID {request.QuestionnaireId} not found");
            }
        }

        // Validate Commentary belongs to current user (if provided)
        if (request.CommentaryId.HasValue)
        {
            var commentary = await _context.Commentaries
                .FirstOrDefaultAsync(c => c.Id == request.CommentaryId.Value && c.UserId == currentUserId);
            
            if (commentary == null)
            {
                throw new ResourceNotFoundException($"Commentary with ID {request.CommentaryId} not found");
            }
        }

        var session = Session.Create(
            request.Name, 
            request.State, 
            currentUserId, 
            request.TableLayoutId,
            request.QuestionnaireId,
            request.CommentaryId);

        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();

        return await GetSessionWithIncludes(session.Id);
    }

    public async Task<SessionModel> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var session = await _context.Sessions
            .Include(s => s.User)
            .Include(s => s.Questionnaire)
                .ThenInclude(q => q.Questions)
            .Include(s => s.TableLayout)
            .Include(s => s.Commentary)
            .Include(s => s.SessionHomeworkStudents)
                .ThenInclude(shs => shs.Student)
            .Include(s => s.SessionRegularStudents)
                .ThenInclude(srs => srs.Student)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == currentUserId && !s.IsDeleted);

        if (session is null)
        {
            throw new ResourceNotFoundException($"Session with id {id} not found");
        }

        return session.ToSessionModel();
    }

    public async Task<PagingResponse<SessionModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<Session>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _context.Sessions
            .Include(s => s.User)
            .Include(s => s.Questionnaire)
                .ThenInclude(q => q.Questions)
            .Include(s => s.TableLayout)
            .Include(s => s.Commentary)
            .Include(s => s.SessionHomeworkStudents)
                .ThenInclude(shs => shs.Student)
            .Include(s => s.SessionRegularStudents)
                .ThenInclude(srs => srs.Student)
            .Where(s => s.UserId == currentUserId && !s.IsDeleted)
            .AsQueryable();

        var page = await pageFilter.ApplyToQueryable(query);
        
        var sessions = page.Items.Select(x => x.ToSessionModel()).ToArray();

        return new PagingResponse<SessionModel>
        {
            Items = sessions,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<SessionModel> UpdateAsync(Guid id, UpdateSessionRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == currentUserId && !s.IsDeleted);

        if (session is null)
        {
            throw new ResourceNotFoundException($"Session with id {id} not found");
        }

        // Validate Questionnaire belongs to current user (if provided)
        if (request.QuestionnaireId.HasValue)
        {
            var questionnaire = await _context.Questionnaires
                .FirstOrDefaultAsync(q => q.Id == request.QuestionnaireId.Value && q.UserId == currentUserId && !q.IsDeleted);
            
            if (questionnaire == null)
            {
                throw new ResourceNotFoundException($"Questionnaire with ID {request.QuestionnaireId} not found");
            }
        }

        // Validate Commentary belongs to current user (if provided)
        if (request.CommentaryId.HasValue)
        {
            var commentary = await _context.Commentaries
                .FirstOrDefaultAsync(c => c.Id == request.CommentaryId.Value && c.UserId == currentUserId);
            
            if (commentary == null)
            {
                throw new ResourceNotFoundException($"Commentary with ID {request.CommentaryId} not found");
            }
        }

        session.Update(
            request.Name, 
            request.State, 
            request.QuestionnaireId, 
            request.CommentaryId,
            request.CurrentSelectedQuestionId,
            request.CurrentSelectedSessionStudentId);

        await _context.SaveChangesAsync();

        return await GetSessionWithIncludes(session.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == currentUserId && !s.IsDeleted);

        if (session is null)
        {
            throw new ResourceNotFoundException($"Session with id {id} not found");
        }

        session.MarkAsDeleted();
        await _context.SaveChangesAsync();
    }

    private async Task<SessionModel> GetSessionWithIncludes(Guid sessionId)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var session = await _context.Sessions
            .Include(s => s.User)
            .Include(s => s.Questionnaire)
                .ThenInclude(q => q.Questions)
            .Include(s => s.TableLayout)
            .Include(s => s.Commentary)
            .Include(s => s.SessionHomeworkStudents)
                .ThenInclude(shs => shs.Student)
            .Include(s => s.SessionRegularStudents)
                .ThenInclude(srs => srs.Student)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == currentUserId && !s.IsDeleted);

        return session.ToSessionModel();
    }
} 