using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Commentaries;

namespace TeachPanel.Application.Contracts;

public interface ICommentaryService
{
    Task<CommentaryModel> CreateAsync(CreateCommentaryRequest request);
    Task<CommentaryModel> GetByIdAsync(Guid id);
    Task<PagingResponse<CommentaryModel>> GetAllAsync(PagingRequest request);
    Task<CommentaryModel> UpdateAsync(Guid id, UpdateCommentaryRequest request);
    Task DeleteAsync(Guid id);
} 