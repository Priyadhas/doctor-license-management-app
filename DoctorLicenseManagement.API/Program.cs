using DoctorLicenseManagement.Application.Interfaces;
using DoctorLicenseManagement.Application.Services;
using DoctorLicenseManagement.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

// Dependency Injection
builder.Services.AddScoped<IDoctorService, DoctorService>();

var app = builder.Build();

// Middleware
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();