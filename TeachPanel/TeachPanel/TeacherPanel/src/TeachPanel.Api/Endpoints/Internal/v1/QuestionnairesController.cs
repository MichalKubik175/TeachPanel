using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeachPanel.Api.Constants;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Questionnaires;

namespace TeachPanel.Api.Endpoints.Internal.v1;

[ApiVersion("1")]
[ApiExplorerSettings(GroupName = EndpointConstants.InternalV1GroupName)]
public sealed class QuestionnairesController : ApiControllerBase
{
    private readonly IQuestionnaireService _questionnaireService;

    public QuestionnairesController(IQuestionnaireService questionnaireService)
    {
        _questionnaireService = questionnaireService;
    }

    [HttpPost]
    public async Task<ActionResult<QuestionnaireModel>> Create([FromBody] CreateQuestionnaireRequest request)
    {
        var result = await _questionnaireService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<QuestionnaireModel>> GetById(Guid id)
    {
        var result = await _questionnaireService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PagingResponse<QuestionnaireModel>>> GetAll([FromQuery] PagingRequest request)
    {
        var result = await _questionnaireService.GetAllAsync(request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<QuestionnaireModel>> Update(Guid id, [FromBody] UpdateQuestionnaireRequest request)
    {
        var result = await _questionnaireService.UpdateAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _questionnaireService.DeleteAsync(id);
        return NoContent();
    }
} 