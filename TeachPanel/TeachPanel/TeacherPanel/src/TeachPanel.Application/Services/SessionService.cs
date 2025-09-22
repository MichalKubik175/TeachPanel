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

    public async Task<PagingResponse<SessionModel>> GetArchivedAsync(PagingRequest request)
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
            .Where(s => s.UserId == currentUserId && s.IsDeleted)
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
            request.CurrentSelectedSessionStudentId,
            request.CurrentQuestionNumber);

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

    public async Task RestoreAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == currentUserId && s.IsDeleted);

        if (session is null)
        {
            throw new ResourceNotFoundException($"Archived session with id {id} not found");
        }

        session.IsDeleted = false;
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<StudentWithAnswersModel>> GetStudentsWithAnswersAsync(Guid sessionId)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        
        // First verify the session exists and belongs to the current user
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == currentUserId && !s.IsDeleted);

        if (session is null)
        {
            throw new ResourceNotFoundException($"Session with id {sessionId} not found");
        }

        // Get all students in the session with their answer counts
        var studentsWithAnswers = await _context.SessionHomeworkStudents
            .Where(shs => shs.SessionId == sessionId)
            .Select(shs => new
            {
                StudentId = shs.StudentId,
                Student = shs.Student,
                HomeworkAnswerCount = _context.SessionHomeworkAnswers
                    .Count(sha => sha.SessionHomeworkStudentId == shs.Id),
                RegularAnswerCount = _context.SessionRegularAnswers
                    .Where(sra => sra.SessionRegularStudent.SessionId == sessionId && 
                                  sra.SessionRegularStudent.StudentId == shs.StudentId)
                    .Count()
            })
            .Union(
                _context.SessionRegularStudents
                    .Where(srs => srs.SessionId == sessionId)
                    .Where(srs => !_context.SessionHomeworkStudents
                        .Any(shs => shs.SessionId == sessionId && shs.StudentId == srs.StudentId))
                    .Select(srs => new
                    {
                        StudentId = srs.StudentId,
                        Student = srs.Student,
                        HomeworkAnswerCount = 0,
                        RegularAnswerCount = _context.SessionRegularAnswers
                            .Count(sra => sra.SessionRegularStudentId == srs.Id)
                    })
            )
            .Where(s => s.HomeworkAnswerCount > 0 || s.RegularAnswerCount > 0)
            .ToListAsync();

        return studentsWithAnswers.Select(s => new StudentWithAnswersModel
        {
            StudentId = s.StudentId,
            Student = s.Student?.ToStudentModel(),
            HasHomeworkAnswers = s.HomeworkAnswerCount > 0,
            HasRegularAnswers = s.RegularAnswerCount > 0,
            HomeworkAnswerCount = s.HomeworkAnswerCount,
            RegularAnswerCount = s.RegularAnswerCount
        });
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