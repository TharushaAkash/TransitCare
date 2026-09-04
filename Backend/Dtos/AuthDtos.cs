using System.ComponentModel.DataAnnotations;

namespace SriLankaTransportComplaints.Api.Dtos;

public record RegisterDto(
    [Required, StringLength(50, MinimumLength = 2), RegularExpression(@"^[A-Za-z][A-Za-z\s'.-]*$")]
    string FirstName,
    [Required, StringLength(50, MinimumLength = 2), RegularExpression(@"^[A-Za-z][A-Za-z\s'.-]*$")]
    string LastName,
    [Required, EmailAddress] string Email,
    [Required, StringLength(10, MinimumLength = 10), RegularExpression(@"^\d{10}$")]
    string PhoneNumber,
    [Required, StringLength(12, MinimumLength = 10), RegularExpression(@"^(\d{12}|\d{9}[vV])$")]
    string NicNumber,
    [Required, MinLength(8)] string Password);

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public record AuthResponseDto(
    int Id,
    string Name,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string NicNumber,
    string Role,
    string Token);
