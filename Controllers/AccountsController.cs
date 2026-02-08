using Microsoft.AspNetCore.Mvc;
using WebApplication2.Dto;
using WebApplication2.Services;

namespace BookkeepingApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountsController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpPost("users/{userId}")]
        public async Task<ActionResult<AccountDto>> CreateAccount(int userId, CreateAccountDto dto)
        {
            try
            {
                var account = await _accountService.CreateAccountAsync(userId, dto);
                return CreatedAtAction(nameof(GetAccountBalance),
                    new { accountId = account.Id }, account);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("users/{userId}")]
        public async Task<ActionResult<IEnumerable<AccountDto>>> GetUserAccounts(int userId)
        {
            var accounts = await _accountService.GetUserAccountsAsync(userId);
            return Ok(accounts);
        }

        [HttpGet("{accountId}/balance")]
        public async Task<ActionResult<AccountBalanceDto>> GetAccountBalance(int accountId)
        {
            try
            {
                var balance = await _accountService.GetAccountBalanceAsync(accountId);
                return Ok(balance);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{accountId}")]
        public async Task<IActionResult> DeactivateAccount(int accountId)
        {
            try
            {
                var result = await _accountService.DeactivateAccountAsync(accountId);
                return result ? NoContent() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
