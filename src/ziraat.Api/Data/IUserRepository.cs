using ziraat.Api.Models;

namespace ziraat.Api.Data;

public interface IUserRepository
{
    Task<User?> FindByUsernameAsync(string username);
}
