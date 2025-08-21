using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Visits;
using TeachPanel.Application.Security;
using TeachPanel.Application.Validators;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class StudentVisitService : IStudentVisitService
{
    private readonly DatabaseContext _databaseContext;
    private readonly ISecurityContext _securityContext;
    private readonly IValidatorFactory _validatorFactory;

    public StudentVisitService(DatabaseContext databaseContext, ISecurityContext securityContext, IValidatorFactory validatorFactory)
    {
        _databaseContext = databaseContext;
        _securityContext = securityContext;
        _validatorFactory = validatorFactory;
    }

    public async Task<StudentVisitModel> CreateAsync(CreateStudentVisitRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();

        // Validate that Student exists and belongs to current user
        var student = await _databaseContext.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && s.UserId == currentUserId);

        if (student is null)
        {
            throw new ResourceNotFoundException($"Student with id {request.StudentId} not found");
        }

        // Check if visit already exists for this date
        var existingVisit = await _databaseContext.StudentVisits
            .FirstOrDefaultAsync(v => v.StudentId == request.StudentId && 
                                    v.VisitDate == request.VisitDate && 
                                    v.UserId == currentUserId);

        if (existingVisit is not null)
        {
            throw new InvalidOperationException($"Visit record already exists for student {student.FullName} on {request.VisitDate}");
        }

        var visit = StudentVisit.Create(request.StudentId, request.VisitDate, request.IsPresent, currentUserId, request.Notes);
        _databaseContext.StudentVisits.Add(visit);
        await _databaseContext.SaveChangesAsync();

        return await GetVisitWithDetailsAsync(visit.Id);
    }

    public async Task<StudentVisitModel> GetByIdAsync(Guid id)
    {
        return await GetVisitWithDetailsAsync(id);
    }

    public async Task<PagingResponse<StudentVisitModel>> GetAllAsync(GetVisitsRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<StudentVisit>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _databaseContext.StudentVisits
            .Include(v => v.Student)
            .ThenInclude(s => s.Group)
            .Include(v => v.Student)
            .ThenInclude(s => s.Brand)
            .Where(v => v.UserId == currentUserId);

        // Apply filters
        if (request.FromDate.HasValue)
            query = query.Where(v => v.VisitDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(v => v.VisitDate <= request.ToDate.Value);

        if (request.GroupId.HasValue)
            query = query.Where(v => v.Student.GroupId == request.GroupId.Value);

        if (request.StudentId.HasValue)
            query = query.Where(v => v.StudentId == request.StudentId.Value);

        if (request.IsPresent.HasValue)
            query = query.Where(v => v.IsPresent == request.IsPresent.Value);

        query = query.OrderByDescending(v => v.VisitDate).ThenBy(v => v.Student.FullName);

        var page = await pageFilter.ApplyToQueryable(query);
        var visitModels = page.Items.Select(v => v.ToStudentVisitModel()).ToArray();

        return new PagingResponse<StudentVisitModel>
        {
            Items = visitModels,
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<StudentVisitModel> UpdateAsync(Guid id, UpdateStudentVisitRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();
        var visit = await _databaseContext.StudentVisits
            .FirstOrDefaultAsync(v => v.Id == id && v.UserId == currentUserId);

        if (visit is null)
        {
            throw new ResourceNotFoundException($"Visit record with id {id} not found");
        }

        visit.UpdateVisitStatus(request.IsPresent, request.Notes);
        await _databaseContext.SaveChangesAsync();

        return await GetVisitWithDetailsAsync(visit.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var visit = await _databaseContext.StudentVisits
            .FirstOrDefaultAsync(v => v.Id == id && v.UserId == currentUserId);

        if (visit is null)
        {
            throw new ResourceNotFoundException($"Visit record with id {id} not found");
        }

        _databaseContext.StudentVisits.Remove(visit);
        await _databaseContext.SaveChangesAsync();
    }

    public async Task<List<StudentVisitModel>> BulkCreateOrUpdateAsync(BulkVisitRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();
        var studentIds = new List<Guid>();

        // Determine which students to process
        if (request.GroupId.HasValue)
        {
            var groupStudents = await _databaseContext.Students
                .Where(s => s.GroupId == request.GroupId.Value && s.UserId == currentUserId)
                .Select(s => s.Id)
                .ToListAsync();

            studentIds.AddRange(groupStudents);
        }
        else if (request.StudentIds?.Any() == true)
        {
            // Validate that all students belong to current user
            var validStudentIds = await _databaseContext.Students
                .Where(s => request.StudentIds.Contains(s.Id) && s.UserId == currentUserId)
                .Select(s => s.Id)
                .ToListAsync();

            studentIds.AddRange(validStudentIds);
        }

        // Remove excluded students
        if (request.ExcludedStudentIds?.Any() == true)
        {
            studentIds = studentIds.Except(request.ExcludedStudentIds).ToList();
        }

        if (!studentIds.Any())
        {
            return new List<StudentVisitModel>();
        }

        var visitModels = new List<StudentVisitModel>();

        foreach (var studentId in studentIds)
        {
            // Check if visit already exists
            var existingVisit = await _databaseContext.StudentVisits
                .FirstOrDefaultAsync(v => v.StudentId == studentId && 
                                        v.VisitDate == request.VisitDate && 
                                        v.UserId == currentUserId);

            if (existingVisit is not null)
            {
                // Update existing visit
                existingVisit.UpdateVisitStatus(request.IsPresent, request.Notes);
                visitModels.Add(await GetVisitWithDetailsAsync(existingVisit.Id));
            }
            else
            {
                // Create new visit
                var visit = StudentVisit.Create(studentId, request.VisitDate, request.IsPresent, currentUserId, request.Notes);
                _databaseContext.StudentVisits.Add(visit);
                await _databaseContext.SaveChangesAsync();
                visitModels.Add(await GetVisitWithDetailsAsync(visit.Id));
            }
        }

        await _databaseContext.SaveChangesAsync();
        return visitModels;
    }

    public async Task<List<GroupVisitSummaryModel>> GetGroupVisitSummariesAsync(DateOnly? fromDate = null, DateOnly? toDate = null)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        
        var query = _databaseContext.StudentVisits
            .Include(v => v.Student)
            .ThenInclude(s => s.Group)
            .Where(v => v.UserId == currentUserId);

        if (fromDate.HasValue)
            query = query.Where(v => v.VisitDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(v => v.VisitDate <= toDate.Value);

        var visits = await query.ToListAsync();

        var summaries = visits
            .GroupBy(v => new { v.Student.GroupId, v.VisitDate })
            .Select(g => new GroupVisitSummaryModel
            {
                GroupId = g.Key.GroupId,
                Group = g.First().Student.Group.ToGroupModel(),
                VisitDate = g.Key.VisitDate,
                TotalStudents = g.Count(),
                PresentStudents = g.Count(v => v.IsPresent),
                AbsentStudents = g.Count(v => !v.IsPresent),
                AttendancePercentage = g.Count() > 0 ? Math.Round((double)g.Count(v => v.IsPresent) / g.Count() * 100, 1) : 0,
                StudentVisits = g.Select(v => v.ToStudentVisitModel()).ToList()
            })
            .OrderByDescending(s => s.VisitDate)
            .ThenBy(s => s.Group.Name)
            .ToList();

        return summaries;
    }

    public async Task<GroupVisitSummaryModel> GetGroupVisitSummaryAsync(Guid groupId, DateOnly visitDate)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();

        // Validate group belongs to user
        var group = await _databaseContext.Groups
            .FirstOrDefaultAsync(g => g.Id == groupId && g.UserId == currentUserId);

        if (group is null)
        {
            throw new ResourceNotFoundException($"Group with id {groupId} not found");
        }

        var visits = await _databaseContext.StudentVisits
            .Include(v => v.Student)
            .ThenInclude(s => s.Group)
            .Include(v => v.Student)
            .ThenInclude(s => s.Brand)
            .Where(v => v.Student.GroupId == groupId && v.VisitDate == visitDate && v.UserId == currentUserId)
            .ToListAsync();

        var totalStudentsInGroup = await _databaseContext.Students
            .CountAsync(s => s.GroupId == groupId && s.UserId == currentUserId);

        var presentStudents = visits.Count(v => v.IsPresent);
        var absentStudents = visits.Count(v => !v.IsPresent);

        return new GroupVisitSummaryModel
        {
            GroupId = groupId,
            Group = group.ToGroupModel(),
            VisitDate = visitDate,
            TotalStudents = totalStudentsInGroup,
            PresentStudents = presentStudents,
            AbsentStudents = absentStudents,
            AttendancePercentage = totalStudentsInGroup > 0 ? Math.Round((double)presentStudents / totalStudentsInGroup * 100, 1) : 0,
            StudentVisits = visits.Select(v => v.ToStudentVisitModel()).ToList()
        };
    }

    private async Task<StudentVisitModel> GetVisitWithDetailsAsync(Guid visitId)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var visit = await _databaseContext.StudentVisits
            .Include(v => v.Student)
            .ThenInclude(s => s.Group)
            .Include(v => v.Student)
            .ThenInclude(s => s.Brand)
            .FirstOrDefaultAsync(v => v.Id == visitId && v.UserId == currentUserId);

        if (visit is null)
        {
            throw new ResourceNotFoundException($"Visit record with id {visitId} not found");
        }

        return visit.ToStudentVisitModel();
    }
}

