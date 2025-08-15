using TeachPanel.Application.Models.Brands;
using TeachPanel.Application.Models.Commentaries;
using TeachPanel.Application.Models.Groups;
using TeachPanel.Application.Models.Questionnaires;
using TeachPanel.Application.Models.Questions;
using TeachPanel.Application.Models.Sessions;
using TeachPanel.Application.Models.SessionHomeworkStudents;
using TeachPanel.Application.Models.SessionRegularStudents;
using TeachPanel.Application.Models.Students;
using TeachPanel.Application.Models.TableLayouts;
using TeachPanel.Application.Models.Users;
using TeachPanel.Application.Models.SessionHomeworkAnswers;
using TeachPanel.Application.Models.SessionRegularAnswers;
using TeachPanel.Core.Models.Entities;

namespace TeachPanel.Application.Mapping;

public static class ModelMappingExtensions
{
    public static CurrentUserDataResponse ToCurrentUserDataResponse(this User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        return new CurrentUserDataResponse
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = EnumMapper.ToRoleModel(user.Role),
        };
    }

    public static GroupModel ToGroupModel(this Group group)
    {
        ArgumentNullException.ThrowIfNull(group);

        return new GroupModel
        {
            Id = group.Id,
            Name = group.Name,
            CreatedAtUtc = group.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = group.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static BrandModel ToBrandModel(this Brand brand)
    {
        ArgumentNullException.ThrowIfNull(brand);

        return new BrandModel
        {
            Id = brand.Id,
            Name = brand.Name,
            CreatedAtLocal = brand.CreatedAtLocal,
            CreatedAtUtc = brand.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = brand.UpdatedAtUtc?.UtcDateTime,
        };
    }



    public static CommentaryModel ToCommentaryModel(this Commentary commentary)
    {
        ArgumentNullException.ThrowIfNull(commentary);

        return new CommentaryModel
        {
            Id = commentary.Id,
            Text = commentary.Text,
            CreatedAtLocal = commentary.CreatedAtLocal,
            CreatedAtUtc = commentary.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = commentary.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static TableLayoutModel ToTableLayoutModel(this TableLayout tableLayout)
    {
        ArgumentNullException.ThrowIfNull(tableLayout);

        return new TableLayoutModel
        {
            Id = tableLayout.Id,
            Name = tableLayout.Name,
            Rows = tableLayout.Rows.Select(r => new TableRowModel
            {
                RowNumber = r.RowNumber,
                TablesCount = r.TablesCount
            }).ToList(),
            CreatedAtLocal = tableLayout.CreatedAtLocal,
            CreatedAtUtc = tableLayout.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = tableLayout.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static SessionModel ToSessionModel(this Session session)
    {
        ArgumentNullException.ThrowIfNull(session);

        return new SessionModel
        {
            Id = session.Id,
            Name = session.Name,
            State = session.State,
            UserId = session.UserId,
            User = session.User?.ToCurrentUserDataResponse(),
            QuestionnaireId = session.QuestionnaireId,
            Questionnaire = session.Questionnaire?.ToQuestionnaireModel(),
            TableLayoutId = session.TableLayoutId,
            TableLayout = session.TableLayout?.ToTableLayoutModel(),
            CommentaryId = session.CommentaryId,
            Commentary = session.Commentary?.ToCommentaryModel(),
            CurrentSelectedQuestionId = session.CurrentSelectedQuestionId,
            CurrentSelectedSessionStudentId = session.CurrentSelectedSessionStudentId,
            CreatedAtLocal = session.CreatedAtLocal,
            CreatedAtUtc = session.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = session.UpdatedAtUtc?.UtcDateTime,
            SessionHomeworkStudents = session.SessionHomeworkStudents?.Select(shs => shs.ToSessionHomeworkStudentModelWithoutSession()).ToList() ?? new List<SessionHomeworkStudentModel>(),
            SessionRegularStudents = session.SessionRegularStudents?.Select(srs => srs.ToSessionRegularStudentModelWithoutSession()).ToList() ?? new List<SessionRegularStudentModel>()
        };
    }

    public static SessionHomeworkStudentModel ToSessionHomeworkStudentModel(this SessionHomeworkStudent sessionHomeworkStudent)
    {
        ArgumentNullException.ThrowIfNull(sessionHomeworkStudent);

        return new SessionHomeworkStudentModel
        {
            Id = sessionHomeworkStudent.Id,
            SessionId = sessionHomeworkStudent.SessionId,
            Session = sessionHomeworkStudent.Session?.ToSessionModel(),
            StudentId = sessionHomeworkStudent.StudentId,
            Student = sessionHomeworkStudent.Student?.ToStudentModel(),
            TableNumber = sessionHomeworkStudent.TableNumber,
            CreatedAtLocal = sessionHomeworkStudent.CreatedAtLocal,
            CreatedAtUtc = sessionHomeworkStudent.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = sessionHomeworkStudent.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static SessionHomeworkStudentModel ToSessionHomeworkStudentModelWithoutSession(this SessionHomeworkStudent sessionHomeworkStudent)
    {
        ArgumentNullException.ThrowIfNull(sessionHomeworkStudent);

        return new SessionHomeworkStudentModel
        {
            Id = sessionHomeworkStudent.Id,
            SessionId = sessionHomeworkStudent.SessionId,
            Session = null, // Avoid circular reference
            StudentId = sessionHomeworkStudent.StudentId,
            Student = sessionHomeworkStudent.Student?.ToStudentModel(),
            TableNumber = sessionHomeworkStudent.TableNumber,
            CreatedAtLocal = sessionHomeworkStudent.CreatedAtLocal,
            CreatedAtUtc = sessionHomeworkStudent.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = sessionHomeworkStudent.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static SessionRegularStudentModel ToSessionRegularStudentModel(this SessionRegularStudent sessionRegularStudent)
    {
        ArgumentNullException.ThrowIfNull(sessionRegularStudent);

        return new SessionRegularStudentModel
        {
            Id = sessionRegularStudent.Id,
            SessionId = sessionRegularStudent.SessionId,
            Session = sessionRegularStudent.Session?.ToSessionModel(),
            StudentId = sessionRegularStudent.StudentId,
            Student = sessionRegularStudent.Student?.ToStudentModel(),
            TableNumber = sessionRegularStudent.TableNumber,
            CreatedAtLocal = sessionRegularStudent.CreatedAtLocal,
            CreatedAtUtc = sessionRegularStudent.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = sessionRegularStudent.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static SessionRegularStudentModel ToSessionRegularStudentModelWithoutSession(this SessionRegularStudent sessionRegularStudent)
    {
        ArgumentNullException.ThrowIfNull(sessionRegularStudent);

        return new SessionRegularStudentModel
        {
            Id = sessionRegularStudent.Id,
            SessionId = sessionRegularStudent.SessionId,
            Session = null, // Avoid circular reference
            StudentId = sessionRegularStudent.StudentId,
            Student = sessionRegularStudent.Student?.ToStudentModel(),
            TableNumber = sessionRegularStudent.TableNumber,
            CreatedAtLocal = sessionRegularStudent.CreatedAtLocal,
            CreatedAtUtc = sessionRegularStudent.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = sessionRegularStudent.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static StudentModel ToStudentModel(this Student student)
    {
        return new StudentModel
        {
            Id = student.Id,
            FullName = student.FullName,
            GroupId = student.GroupId,
            Group = student.Group?.ToGroupModel(),
            BrandId = student.BrandId,
            Brand = student.Brand?.ToBrandModel(),
            CreatedAtLocal = student.CreatedAtLocal,
            CreatedAtUtc = student.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = student.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static QuestionnaireModel ToQuestionnaireModel(this Questionnaire questionnaire)
    {
        ArgumentNullException.ThrowIfNull(questionnaire);

        return new QuestionnaireModel
        {
            Id = questionnaire.Id,
            Name = questionnaire.Name,
            CreatedAtLocal = questionnaire.CreatedAtLocal,
            CreatedAtUtc = questionnaire.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = questionnaire.UpdatedAtUtc?.UtcDateTime,
            IsDeleted = questionnaire.IsDeleted,
            DeletedAtUtc = questionnaire.DeletedAtUtc?.UtcDateTime,
            Questions = questionnaire.Questions?.Where(q => !q.IsDeleted).Select(q => q.ToQuestionModel()).ToList() ??
                        new List<QuestionModel>()
        };
    }
    public static QuestionModel ToQuestionModel(this Question question)
    {
        ArgumentNullException.ThrowIfNull(question);

        return new QuestionModel
        {
            Id = question.Id,
            Name = question.Name,
            Answer = question.Answer,
            QuestionnaireId = question.QuestionnaireId,
            CreatedAtLocal = question.CreatedAtLocal,
            CreatedAtUtc = question.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = question.UpdatedAtUtc?.UtcDateTime,
            IsDeleted = question.IsDeleted,
            DeletedAtUtc = question.DeletedAtUtc?.UtcDateTime,
        };
    }

    public static SessionHomeworkAnswerModel ToSessionHomeworkAnswerModel(this SessionHomeworkAnswer answer)
    {
        ArgumentNullException.ThrowIfNull(answer);
        return new SessionHomeworkAnswerModel
        {
            Id = answer.Id,
            SessionHomeworkStudentId = answer.SessionHomeworkStudentId,
            SessionHomeworkStudent = answer.SessionHomeworkStudent?.ToSessionHomeworkStudentModel(),
            QuestionId = answer.QuestionId,
            Question = answer.Question?.ToQuestionModel(),
            State = answer.State,
            CreatedAtLocal = answer.CreatedAtLocal,
            CreatedAtUtc = answer.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = answer.UpdatedAtUtc?.UtcDateTime,
        };
    }

    public static SessionRegularAnswerModel ToSessionRegularAnswerModel(this SessionRegularAnswer answer)
    {
        ArgumentNullException.ThrowIfNull(answer);
        return new SessionRegularAnswerModel
        {
            Id = answer.Id,
            SessionRegularStudentId = answer.SessionRegularStudentId,
            SessionRegularStudent = answer.SessionRegularStudent?.ToSessionRegularStudentModel(),
            State = answer.State,
            CreatedAtLocal = answer.CreatedAtLocal,
            CreatedAtUtc = answer.CreatedAtUtc.UtcDateTime,
            UpdatedAtUtc = answer.UpdatedAtUtc?.UtcDateTime,
        };
    }
}