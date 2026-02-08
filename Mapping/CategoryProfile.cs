using AutoMapper;
using WebApplication2.Dto;
using WebApplication2.Models;

namespace WebApplication2.Mapping
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            // Category mappings
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();

            // Transaction mappings (actualiza estos también)
            CreateMap<Transaction, TransactionDto>()
                .ForMember(dest => dest.CategoryName,
                          opt => opt.MapFrom(src => src.Category.Name));

            CreateMap<CreateTransactionDto, Transaction>();
        }
    }
}
