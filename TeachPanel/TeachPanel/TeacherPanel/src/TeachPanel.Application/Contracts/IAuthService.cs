using TeachPanel.Application.Models.Auth;
using TeachPanel.Application.Models.Users;

namespace TeachPanel.Application.Contracts;

public interface IAuthService
{
    Task<CurrentUserDataResponse> SignUp(SignUpRequest request);
    Task<JwtAuthResponse> SignIn(SignInRequest request);
    Task DeactivateRefreshToken(ExpireRefreshTokenRequest request);
    Task DeactivateCookieRefreshToken();
    Task ChangePassword(ChangePasswordRequest request);
    Task<CurrentUserDataResponse> GetCurrentUserData();
    Task<JwtAuthResponse> RefreshAccessToken(RefreshAccessTokenRequest request);
    Task<JwtAuthResponse> RefreshCookieAccessToken();
}