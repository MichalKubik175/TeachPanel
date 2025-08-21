using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeachPanel.Api.Constants;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Visits;
using TeachPanel.Core.Models.Api;

namespace TeachPanel.Api.Endpoints.Internal.v1;

[ApiVersion("1")]
[ApiExplorerSettings(GroupName = EndpointConstants.InternalV1GroupName)]
public sealed class StudentVisitsController : ApiControllerBase
{
    private readonly IStudentVisitService _studentVisitService;

    public StudentVisitsController(IStudentVisitService studentVisitService)
    {
        _studentVisitService = studentVisitService;
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(StudentVisitModel), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAsync([FromBody] CreateStudentVisitRequest request)
    {
        var response = await _studentVisitService.CreateAsync(request);
        return Created(response);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(StudentVisitModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var response = await _studentVisitService.GetByIdAsync(id);
        return Ok(response);
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagingResponse<StudentVisitModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetVisitsRequest request)
    {
        var response = await _studentVisitService.GetAllAsync(request);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(StudentVisitModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdateStudentVisitRequest request)
    {
        var response = await _studentVisitService.UpdateAsync(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        await _studentVisitService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("bulk")]
    [Authorize]
    [ProducesResponseType(typeof(List<StudentVisitModel>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkCreateOrUpdateAsync([FromBody] BulkVisitRequest request)
    {
        var response = await _studentVisitService.BulkCreateOrUpdateAsync(request);
        return Ok(response);
    }

    [HttpGet("summaries")]
    [Authorize]
    [ProducesResponseType(typeof(List<GroupVisitSummaryModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGroupVisitSummariesAsync([FromQuery] DateOnly? fromDate = null, [FromQuery] DateOnly? toDate = null)
    {
        var response = await _studentVisitService.GetGroupVisitSummariesAsync(fromDate, toDate);
        return Ok(response);
    }

    [HttpGet("summaries/{groupId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(GroupVisitSummaryModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGroupVisitSummaryAsync(Guid groupId, [FromQuery] DateOnly visitDate)
    {
        var response = await _studentVisitService.GetGroupVisitSummaryAsync(groupId, visitDate);
        return Ok(response);
    }
}

