using DoctorLicenseManagement.Application.DTOs;
using DoctorLicenseManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DoctorLicenseManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _doctorService;

    public DoctorsController(IDoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _doctorService.GetAllDoctorsAsync();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddDoctor(CreateDoctorDto dto)
    {
        var result = await _doctorService.AddDoctorAsync(dto);
        return Ok(new { Id = result });
    }
}