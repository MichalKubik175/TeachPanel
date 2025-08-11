using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionRegularStudents;
using TeachPanel.Application.Security;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class SessionRegularStudentService : ISessionRegularStudentService
{
    private readonly DatabaseContext _context;
    private readonly ISecurityContext _securityContext;

    public SessionRegularStudentService(DatabaseContext context, ISecurityContext securityContext)
    {
        _context = context;
        _securityContext = securityContext;
    }

    public async Task<SessionRegularStudentModel> CreateAsync(CreateSessionRegularStudentRequest request)
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

        var existingAssignment = await _context.SessionRegularStudents
            .AnyAsync(srs => srs.SessionId == request.SessionId && srs.StudentId == request.StudentId && srs.UserId == currentUserId);
        if (existingAssignment)
        {
            throw new ValidationFailedException($"Student is already assigned to this session");
        }

        var sessionRegularStudent = SessionRegularStudent.Create(
            request.SessionId,
            request.StudentId,
            request.TableNumber,
            currentUserId
        );

        _context.SessionRegularStudents.Add(sessionRegularStudent);
        await _context.SaveChangesAsync();

        return sessionRegularStudent.ToSessionRegularStudentModel();
    }

    public async Task<SessionRegularStudentModel?> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var sessionRegularStudent = await _context.SessionRegularStudents
            .Include(srs => srs.Session)
            .Include(srs => srs.Student)
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        return sessionRegularStudent?.ToSessionRegularStudentModel();
    }

    public async Task<PagingResponse<SessionRegularStudentModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<SessionRegularStudent>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _context.SessionRegularStudents
            .Include(srs => srs.Session)
            .Include(srs => srs.Student)
            .Where(srs => srs.UserId == currentUserId)
            .AsQueryable();

        var page = await pageFilter.ApplyToQueryable(query);
        var sessionRegularStudents = page.Items.Select(x => x.ToSessionRegularStudentModel()).ToArray();

        return new PagingResponse<SessionRegularStudentModel>
        {
            Items = sessionRegularStudents,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<SessionRegularStudentModel> UpdateAsync(Guid id, UpdateSessionRegularStudentRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var sessionRegularStudent = await _context.SessionRegularStudents
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        if (sessionRegularStudent == null)
            throw new ResourceNotFoundException($"SessionRegularStudent with id {id} not found");

        sessionRegularStudent.Update(request.TableNumber);

        await _context.SaveChangesAsync();

        return sessionRegularStudent.ToSessionRegularStudentModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var sessionRegularStudent = await _context.SessionRegularStudents
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == currentUserId);

        if (sessionRegularStudent == null)
            throw new ResourceNotFoundException($"SessionRegularStudent with id {id} not found");

        _context.SessionRegularStudents.Remove(sessionRegularStudent);
        await _context.SaveChangesAsync();
    }
} 