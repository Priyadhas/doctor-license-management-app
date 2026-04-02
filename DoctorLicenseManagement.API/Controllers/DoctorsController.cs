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

    [HttpPost]
    public async Task<IActionResult> AddDoctor(CreateDoctorDto dto)
    {
        var result = await _doctorService.AddDoctorAsync(dto);

        return Ok(new
        {
            success = true,
            message = "Doctor added successfully",
            data = result
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(string? search, string? status)
    {
        var result = await _doctorService.GetAllDoctorsAsync(search, status);

        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _doctorService.GetDoctorByIdAsync(id);

        if (result == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Doctor not found"
            });
        }

        return Ok(new
        {
            success = true,
            message = "Doctor fetched successfully",
            data = result
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateDoctorDto dto)
    {
        var result = await _doctorService.UpdateDoctorAsync(id, dto);

        return Ok(new { success = result });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, string status)
    {
        var result = await _doctorService.UpdateStatusAsync(id, status);

        return Ok(new { success = result });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _doctorService.DeleteDoctorAsync(id);

        return Ok(new { success = result });
    }
    }