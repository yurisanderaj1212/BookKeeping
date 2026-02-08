using AutoMapper;
using WebApplication2.Dto;
using WebApplication2.Models;

public class TransactionProfile : Profile
{
    public TransactionProfile()
    {
        CreateMap<DateOnly, DateTime>().ConvertUsing(d => d.ToDateTime(TimeOnly.MinValue));

        CreateMap<Transaction, TransactionDto>()
            .ForMember(dest => dest.CategoryName,
                      opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.CategoryId,
                      opt => opt.MapFrom(src => src.Category.Id));

        CreateMap<CreateTransactionDto, Transaction>()
                 .ForMember(dest => dest.Id, opt => opt.Ignore())
                 .ForMember(dest => dest.User, opt => opt.Ignore())
                 .ForMember(dest => dest.UserId, opt => opt.Ignore())
                 .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());




        CreateMap<UpdateTransactionDto, Transaction>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
           



    }
}

