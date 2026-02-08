using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Models;

namespace WebApplication2.Services
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<User?> GetByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }
        public async Task<User?> GetByIdAsync(int userId, bool includeAccounts = false)
        {
            if (includeAccounts)
            {
                return await _context.Users
                    .Include(u => u.Accounts)
                    .FirstOrDefaultAsync(u => u.Id == userId);
            }

            return await _context.Users.FindAsync(userId);
        }
    }
}