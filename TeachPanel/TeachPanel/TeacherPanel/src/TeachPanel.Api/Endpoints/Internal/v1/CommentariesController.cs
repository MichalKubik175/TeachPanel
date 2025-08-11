using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeachPanel.Api.Constants;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Commentaries;
using TeachPanel.Application.Models.Common;
using TeachPanel.Core.Models.Api;

namespace TeachPanel.Api.Endpoints.Internal.v1;

[ApiVersion("1")]
[ApiExplorerSettings(GroupName = EndpointConstants.InternalV1GroupName)]
public sealed class CommentariesController : ApiControllerBase
{
    private readonly ICommentaryService _commentaryService;

    public CommentariesController(ICommentaryService commentaryService)
    {
        _commentaryService = commentaryService;
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(CommentaryModel), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAsync([FromBody] CreateCommentaryRequest request)
    {
        var response = await _commentaryService.CreateAsync(request);
        return Created(response);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(CommentaryModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var response = await _commentaryService.GetByIdAsync(id);
        return Ok(response);
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagingResponse<CommentaryModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllAsync([FromQuery] PagingRequest request)
    {
        var response = await _commentaryService.GetAllAsync(request);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(CommentaryModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdateCommentaryRequest request)
    {
        var response = await _commentaryService.UpdateAsync(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        await _commentaryService.DeleteAsync(id);
        return NoContent();
    }
} 