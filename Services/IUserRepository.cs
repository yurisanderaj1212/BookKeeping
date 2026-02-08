using WebApplication2.Models;

namespace WebApplication2.Services
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int UserId);
    }
}
