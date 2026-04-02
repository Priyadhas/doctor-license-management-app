using DoctorLicenseManagement.Application.Interfaces;
using DoctorLicenseManagement.Application.Services;
using DoctorLicenseManagement.API.Middleware;
using DoctorLicenseManagement.API.Database;
using DoctorLicenseManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        // Extract all validation errors safely
        var errorList = context.ModelState
            .Where(entry => entry.Value?.Errors?.Count > 0)
            .SelectMany(entry => entry.Value!.Errors.Select(error => new
            {
                Field = entry.Key,
                Message = string.IsNullOrWhiteSpace(error.ErrorMessage)
                    ? "Invalid input format"
                    : error.ErrorMessage
            }))
            .ToList();

        // Optional: first error message (for simple UI)
        var firstErrorMessage = errorList.FirstOrDefault()?.Message ?? "Invalid request";

        return new BadRequestObjectResult(new
        {
            success = false,
            message = firstErrorMessage,
            errors = errorList 
        });
    };
});

// Dependency Injection
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();

var app = builder.Build();

// Middleware
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthorization();

app.MapControllers();

// Database Initializer
var initializer = new DatabaseInitializer(builder.Configuration);
await initializer.InitializeAsync();

app.Run();