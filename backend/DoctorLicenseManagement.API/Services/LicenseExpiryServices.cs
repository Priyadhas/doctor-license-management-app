using DoctorLicenseManagement.Application.Services;
using DoctorLicenseManagement.Application.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Data;
using Dapper;

public class LicenseExpiryService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<LicenseExpiryService> _logger;

    public LicenseExpiryService(
        IServiceProvider serviceProvider,
        ILogger<LicenseExpiryService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("License expiry service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();

               var doctorService = scope.ServiceProvider.GetRequiredService<IDoctorService>();

                var updated = await doctorService.ExpireLicensesAsync();

                _logger.LogInformation($"Expired {updated} licenses");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running expiry job");
            }

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}