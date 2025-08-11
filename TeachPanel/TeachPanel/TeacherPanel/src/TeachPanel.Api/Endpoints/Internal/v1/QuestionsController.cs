using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeachPanel.Api.Constants;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Common;
using TeachPanel.Application.Models.Questions;

namespace TeachPanel.Api.Endpoints.Internal.v1;

[ApiVersion("1")]
[ApiExplorerSettings(GroupName = EndpointConstants.InternalV1GroupName)]
public sealed class QuestionsController : ApiControllerBase
{
    private readonly IQuestionService _questionService;

    public QuestionsController(IQuestionService questionService)
    {
        _questionService = questionService;
    }

    [HttpPost]
    public async Task<ActionResult<QuestionModel>> Create([FromBody] CreateQuestionRequest request, [FromQuery] Guid questionnaireId)
    {
        var result = await _questionService.CreateAsync(request, questionnaireId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<QuestionModel>> GetById(Guid id)
    {
        var result = await _questionService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PagingResponse<QuestionModel>>> GetAll([FromQuery] PagingRequest request)
    {
        var result = await _questionService.GetAllAsync(request);
        return Ok(result);
    }

    [HttpGet("questionnaire/{questionnaireId:guid}")]
    public async Task<ActionResult<PagingResponse<QuestionModel>>> GetByQuestionnaireId(
        Guid questionnaireId, 
        [FromQuery] PagingRequest request)
    {
        var result = await _questionService.GetByQuestionnaireIdAsync(questionnaireId, request);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<QuestionModel>> Update(Guid id, [FromBody] UpdateQuestionRequest request)
    {
        var result = await _questionService.UpdateAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        await _questionService.DeleteAsync(id);
        return NoContent();
    }
} 