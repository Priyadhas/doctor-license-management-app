using DoctorLicenseManagement.Application.Interfaces;
using DoctorLicenseManagement.Application.Services;
using DoctorLicenseManagement.API.Middleware;
using DoctorLicenseManagement.API.Database;
using DoctorLicenseManagement.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

// Dependency Injection
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();

var app = builder.Build();

// Database Initializer
var initializer = new DatabaseInitializer(builder.Configuration);
await initializer.InitializeAsync();

// Middleware
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();