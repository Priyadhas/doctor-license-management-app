using System.Data;

namespace DoctorLicenseManagement.Application.Interfaces;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}