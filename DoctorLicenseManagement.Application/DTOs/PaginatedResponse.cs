namespace DoctorLicenseManagement.Application.DTOs;

public class PaginatedResponse<T>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    public IReadOnlyList<T> Data { get; set; } = new List<T>();
}