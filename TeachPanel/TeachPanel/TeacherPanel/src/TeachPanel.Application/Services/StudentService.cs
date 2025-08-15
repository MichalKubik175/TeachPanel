using Microsoft.EntityFrameworkCore;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Mapping;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Students;
using TeachPanel.Application.Security;
using TeachPanel.Application.Utils;
using TeachPanel.Application.Validators;
using TeachPanel.Core.Exceptions;
using TeachPanel.Core.Models.Entities;
using TeachPanel.Core.Models.Enums;
using TeachPanel.DataAccess.Connection;
using TeachPanel.DataAccess.DataManipulation;

namespace TeachPanel.Application.Services;

public sealed class StudentService : IStudentService
{
    private readonly DatabaseContext _databaseContext;
    private readonly ISecurityContext _securityContext;
    private readonly IValidatorFactory _validatorFactory;

    public StudentService(DatabaseContext databaseContext, ISecurityContext securityContext, IValidatorFactory validatorFactory)
    {
        _databaseContext = databaseContext;
        _securityContext = securityContext;
        _validatorFactory = validatorFactory;
    }

    public async Task<StudentModel> CreateAsync(CreateStudentRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();

        // Validate that Brand exists and belongs to current user
        var brand = await _databaseContext.Brands
            .FirstOrDefaultAsync(b => b.Id == request.BrandId && b.UserId == currentUserId);

        if (brand is null)
        {
            throw new ResourceNotFoundException($"Brand with id {request.BrandId} not found");
        }

        // Validate that Group exists and belongs to current user
        var group = await _databaseContext.Groups
            .FirstOrDefaultAsync(g => g.Id == request.GroupId && g.UserId == currentUserId);

        if (group is null)
        {
            throw new ResourceNotFoundException($"Group with id {request.GroupId} not found");
        }

        var student = Student.Create(request.FullName, request.GroupId, request.BrandId, currentUserId);
        _databaseContext.Students.Add(student);
        await _databaseContext.SaveChangesAsync();

        return student.ToStudentModel();
    }

    public async Task<StudentModel> GetByIdAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var student = await _databaseContext.Students
            .Include(s => s.Group)
            .Include(s => s.Brand)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == currentUserId);

        if (student is null)
        {
            throw new ResourceNotFoundException($"Student with id {id} not found");
        }

        return student.ToStudentModel();
    }

    public async Task<PagingResponse<StudentModel>> GetAllAsync(PagingRequest request)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var pageFilter = new PageFilter<Student>
        {
            PageNumber = request.Page,
            PageSize = request.PageSize
        };

        var query = _databaseContext.Students
            .Include(s => s.Group)
            .Include(s => s.Brand)
            .Where(s => s.UserId == currentUserId)
            .AsQueryable();
        var page = await pageFilter.ApplyToQueryable(query);
        
        // Get scores for each student
        var studentsWithScores = new List<StudentModel>();
        foreach (var student in page.Items)
        {
            var studentModel = student.ToStudentModel();
            
            // Calculate homework score
            var homeworkScore = await CalculateHomeworkScoreAsync(student.Id);
            studentModel.HomeworkScore = homeworkScore;
            
            // Calculate regular session score
            var regularScore = await CalculateRegularScoreAsync(student.Id);
            studentModel.RegularScore = regularScore;
            
            studentsWithScores.Add(studentModel);
        }

        return new PagingResponse<StudentModel>
        {
            Items = studentsWithScores.ToArray(),
            Meta = new PageMetadataModel(page.PageCount, page.PageNumber, page.ItemsCount)
        };
    }

    public async Task<StudentModel> UpdateAsync(Guid id, UpdateStudentRequest request)
    {
        _validatorFactory.ValidateAndThrow(request);

        var currentUserId = _securityContext.GetUserIdOrThrow();
        var student = await _databaseContext.Students
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == currentUserId);

        if (student is null)
        {
            throw new ResourceNotFoundException($"Student with id {id} not found");
        }

        // Validate that Brand exists and belongs to current user
        var brand = await _databaseContext.Brands
            .FirstOrDefaultAsync(b => b.Id == request.BrandId && b.UserId == currentUserId);

        if (brand is null)
        {
            throw new ResourceNotFoundException($"Brand with id {request.BrandId} not found");
        }

        // Validate that new Group exists and belongs to current user
        var group = await _databaseContext.Groups
            .FirstOrDefaultAsync(g => g.Id == request.GroupId && g.UserId == currentUserId);

        if (group is null)
        {
            throw new ResourceNotFoundException($"Group with id {request.GroupId} not found");
        }

        student.UpdateInfo(request.FullName, request.GroupId, request.BrandId);
        await _databaseContext.SaveChangesAsync();

        return student.ToStudentModel();
    }

    public async Task DeleteAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var student = await _databaseContext.Students
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == currentUserId);

        if (student is null)
        {
            throw new ResourceNotFoundException($"Student with id {id} not found");
        }

        _databaseContext.Students.Remove(student);
        await _databaseContext.SaveChangesAsync();
    }

    private async Task<StudentModel> GetStudentWithGroupAsync(Guid id)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var student = await _databaseContext.Students
            .Include(s => s.Group)
            .Include(s => s.Brand)
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == currentUserId);

        if (student == null) return null;

        var studentModel = student.ToStudentModel();
        
        // Calculate scores
        var homeworkScore = await CalculateHomeworkScoreAsync(student.Id);
        studentModel.HomeworkScore = homeworkScore;
        
        var regularScore = await CalculateRegularScoreAsync(student.Id);
        studentModel.RegularScore = regularScore;

        return studentModel;
    }
    
    private async Task<int> CalculateHomeworkScoreAsync(Guid studentId)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var homeworkAnswers = await _databaseContext.SessionHomeworkAnswers
            .Include(a => a.SessionHomeworkStudent)
            .Where(a => a.SessionHomeworkStudent.StudentId == studentId && a.SessionHomeworkStudent.UserId == currentUserId)
            .ToListAsync();
        
        if (!homeworkAnswers.Any()) return 0;
        
        var totalAnswers = homeworkAnswers.Count;
        var greenAnswers = homeworkAnswers.Count(a => a.State == SessionHomeworkAnswerState.Green);
        var yellowAnswers = homeworkAnswers.Count(a => a.State == SessionHomeworkAnswerState.Yellow);
        var redAnswers = homeworkAnswers.Count(a => a.State == SessionHomeworkAnswerState.Red);
        
        // Calculate score: Green = 100%, Yellow = 50%, Red = 0%
        var score = (greenAnswers * 100 + yellowAnswers * 50) / totalAnswers;
        return score;
    }
    
    private async Task<int> CalculateRegularScoreAsync(Guid studentId)
    {
        var currentUserId = _securityContext.GetUserIdOrThrow();
        var regularAnswers = await _databaseContext.SessionRegularAnswers
            .Include(a => a.SessionRegularStudent)
            .Where(a => a.SessionRegularStudent.StudentId == studentId && a.SessionRegularStudent.UserId == currentUserId)
            .ToListAsync();
        
        if (!regularAnswers.Any()) return 0;
        
        var totalAnswers = regularAnswers.Count;
        var greenAnswers = regularAnswers.Count(a => a.State == SessionRegularAnswerState.Green);
        var yellowAnswers = regularAnswers.Count(a => a.State == SessionRegularAnswerState.Yellow);
        var redAnswers = regularAnswers.Count(a => a.State == SessionRegularAnswerState.Red);
        
        // Calculate score: Green = 100%, Yellow = 50%, Red = 0%
        var score = (greenAnswers * 100 + yellowAnswers * 50) / totalAnswers;
        return score;
    }
} 