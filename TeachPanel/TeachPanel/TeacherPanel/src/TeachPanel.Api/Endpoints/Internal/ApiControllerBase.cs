using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeachPanel.Api.Security;

namespace TeachPanel.Api.Endpoints.Internal;

[ApiController]
[Route("internal/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize]
[ServiceFilter(typeof(SecurityContextFilter))]
public class ApiControllerBase : ControllerBase
{
    protected ObjectResult Created(object response)
    {
        return new ObjectResult(response) { StatusCode = StatusCodes.Status201Created };
    }
}