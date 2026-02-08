using AutoMapper;
using WebApplication2.Dto;
using WebApplication2.Models;

namespace WebApplication2.Mapping
{
    public class AccountProfile : Profile
    {
        public AccountProfile()
        {
            CreateMap<Account, AccountDto>()
                .ForMember(dest => dest.Currency,
                    opt => opt.MapFrom(src => src.Currency.ToUpper()));

            CreateMap<CreateAccountDto, Account>()
                .ForMember(dest => dest.CurrentBalance,
                    opt => opt.MapFrom(src => src.InitialBalance))
                .ForMember(dest => dest.CreatedAt,
                    opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt,
                    opt => opt.MapFrom(_ => DateTime.UtcNow));
        }
    }
}
