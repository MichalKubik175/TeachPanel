using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeachPanel.Api.Constants;
using TeachPanel.Application.Contracts;
using TeachPanel.Application.Models.Auth;
using TeachPanel.Application.Models.Users;
using TeachPanel.Core.Models.Api;

namespace TeachPanel.Api.Endpoints.Internal.v1;

[ApiVersion("1")]
[ApiExplorerSettings(GroupName = EndpointConstants.InternalV1GroupName)]
public sealed class AuthController : ApiControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }
    
    [HttpPost("sign-up")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CurrentUserDataResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SignUpAsync([FromBody] SignUpRequest request)
    {
        var response = await _authService.SignUp(request);
        return Created(response);
    }
    
    [HttpPost("sign-in")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(JwtAuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SignInAsync([FromBody] SignInRequest request)
    {
        var response = await _authService.SignIn(request);
        return Ok(response);
    }
    
    [HttpGet("me")]
    [ProducesResponseType(typeof(CurrentUserDataResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrentUserAsync()
    {
        var response = await _authService.GetCurrentUserData();
        return Ok(response);
    }
    
    [HttpPost("refresh-access-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(JwtAuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshAccessTokenAsync([FromBody] RefreshAccessTokenRequest request)
    {
        var response = await _authService.RefreshAccessToken(request);
        return Ok(response);
    }
    
    [HttpPost("refresh-cookie-access-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(JwtAuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshCookieAccessTokenAsync()
    {
        var response = await _authService.RefreshCookieAccessToken();
        return Ok(response);
    }
    
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordRequest request)
    {
        await _authService.ChangePassword(request);
        return NoContent();
    }
    
    [HttpPost("deactivate-refresh-token")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeactivateRefreshTokenAsync([FromBody] ExpireRefreshTokenRequest request)
    {
        await _authService.DeactivateRefreshToken(request);
        return NoContent();
    }
    
    [HttpPost("deactivate-cookie-refresh-token")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeactivateCookieRefreshTokenAsync()
    {
        await _authService.DeactivateCookieRefreshToken();
        return NoContent();
    }
}