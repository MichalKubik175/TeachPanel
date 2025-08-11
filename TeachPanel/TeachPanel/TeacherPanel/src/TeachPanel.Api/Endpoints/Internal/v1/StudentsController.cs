using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeachPanel.Api.Constants;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Students;
using TeachPanel.Core.Models.Api;

namespace TeachPanel.Api.Endpoints.Internal.v1;

[ApiVersion("1")]
[ApiExplorerSettings(GroupName = EndpointConstants.InternalV1GroupName)]
public sealed class StudentsController : ApiControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(StudentModel), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAsync([FromBody] CreateStudentRequest request)
    {
        var response = await _studentService.CreateAsync(request);
        return Created(response);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(StudentModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByIdAsync(Guid id)
    {
        var response = await _studentService.GetByIdAsync(id);
        return Ok(response);
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagingResponse<StudentModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllAsync([FromQuery] PagingRequest request)
    {
        var response = await _studentService.GetAllAsync(request);
        return Ok(response);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(StudentModel), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdateStudentRequest request)
    {
        var response = await _studentService.UpdateAsync(id, request);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid id)
    {
        await _studentService.DeleteAsync(id);
        return NoContent();
    }
} 