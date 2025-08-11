using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeachPanel.Api.Constants;
using TeachPanel.Api.Endpoints.Internal;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.SessionRegularStudents;
using TeachPanel.Core.Models.Api;

namespace TeachPanel.Api.Endpoints.Internal.v1;

[ApiVersion("1")]
[ApiExplorerSettings(GroupName = EndpointConstants.InternalV1GroupName)]
public sealed class SessionRegularStudentsController : ApiControllerBase
{
    private readonly ISessionRegularStudentService _sessionRegularStudentService;

    public SessionRegularStudentsController(ISessionRegularStudentService sessionRegularStudentService)
    {
        _sessionRegularStudentService = sessionRegularStudentService;
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(SessionRegularStudentModel), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAsync([FromBody] CreateSessionRegularStudentRequest request)
    {
        var response = await _sessionRegularStudentService.CreateAsync(request);
        return Created(response);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(SessionRegularStudentModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var response = await _sessionRegularStudentService.GetByIdAsync(id);
        return Ok(response);
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagingResponse<SessionRegularStudentModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllAsync([FromQuery] PagingRequest request)
    {
        var response = await _sessionRegularStudentService.GetAllAsync(request);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(SessionRegularStudentModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdateSessionRegularStudentRequest request)
    {
        var response = await _sessionRegularStudentService.UpdateAsync(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        await _sessionRegularStudentService.DeleteAsync(id);
        return NoContent();
    }
} 