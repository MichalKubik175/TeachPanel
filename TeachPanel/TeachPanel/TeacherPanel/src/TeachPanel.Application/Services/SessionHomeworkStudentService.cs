using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionHomeworkStudents;
using TeachPanel.Application.Security;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class SessionHomeworkStudentService : ISessionHomeworkStudentService
{
    private readonly DatabaseContext _context;
    private readonly ISecurityContext _securityContext;

    public SessionHomeworkStudentService(DatabaseContext context, ISecurityContext securityContext)
    {
        _context = context;
        _securityContext = securityContext;
    }

    public async Task<SessionHomeworkStudentModel> CreateAsync(CreateSessionHomeworkStudentRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();

        // Validate that Session exists and belongs to current user
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == currentUserId);
        if (session is null)
        {
            throw new ResourceNotFoundException($"Session with id {request.SessionId} not found");
        }

        // Validate that Student exists and belongs to current user
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && s.UserId == currentUserId);
        if (student is null)
        {
            throw new ResourceNotFoundException($"Student with id {request.StudentId} not found");
        }

        // Check if student is already assigned to this session
        var existingAssignment = await _context.SessionHomeworkStudents
            .AnyAsync(shs => shs.SessionId == request.SessionId && shs.StudentId == request.StudentId && shs.UserId == currentUserId);
        
        if (existingAssignment)
        {
            throw new ValidationFailedException($"Student is already assigned to this session");
        }

        var sessionHomeworkStudent = SessionHomeworkStudent.Create(
            request.SessionId,
            request.StudentId,
            request.TableNumber,
            currentUserId
        );

        _context.SessionHomeworkStudents.Add(sessionHomeworkStudent);
        await _context.SaveChangesAsync();

        return sessionHomeworkStudent.ToSessionHomeworkStudentModel();
    }

    public async Task<SessionHomeworkStudentModel?> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var sessionHomeworkStudent = await _context.SessionHomeworkStudents
            .Include(shs => shs.Session)
            .Include(shs => shs.Student)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        return sessionHomeworkStudent?.ToSessionHomeworkStudentModel();
    }

    public async Task<PagingResponse<SessionHomeworkStudentModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<SessionHomeworkStudent>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _context.SessionHomeworkStudents
            .Include(shs => shs.Session)
            .Include(shs => shs.Student)
            .Where(shs => shs.UserId == currentUserId)
            .AsQueryable();

        var page = await pageFilter.ApplyToQueryable(query);
        
        var sessionHomeworkStudents = page.Items.Select(x => x.ToSessionHomeworkStudentModel()).ToArray();

        return new PagingResponse<SessionHomeworkStudentModel>
        {
            Items = sessionHomeworkStudents,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<SessionHomeworkStudentModel> UpdateAsync(Guid id, UpdateSessionHomeworkStudentRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var sessionHomeworkStudent = await _context.SessionHomeworkStudents
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        if (sessionHomeworkStudent == null)
            throw new ResourceNotFoundException($"SessionHomeworkStudent with id {id} not found");

        sessionHomeworkStudent.Update(request.TableNumber);

        await _context.SaveChangesAsync();

        return sessionHomeworkStudent.ToSessionHomeworkStudentModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var sessionHomeworkStudent = await _context.SessionHomeworkStudents
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        if (sessionHomeworkStudent == null)
            throw new ResourceNotFoundException($"SessionHomeworkStudent with id {id} not found");

        _context.SessionHomeworkStudents.Remove(sessionHomeworkStudent);
        await _context.SaveChangesAsync();
    }
} 