using WebApplication2.Dto;

public class TokenResponse
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }  // Opcional, para renovar tokens
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; }  // DTO simplificado para evitar exponer datos sensibles
}