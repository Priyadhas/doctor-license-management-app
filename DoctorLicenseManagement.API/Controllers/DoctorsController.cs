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

    // ============================
    // CREATE DOCTOR
    // ============================
    [HttpPost]
    public async Task<IActionResult> AddDoctor([FromBody] CreateDoctorDto dto)
    {
        var result = await _doctorService.AddDoctorAsync(dto);

        return Created("", new
        {
            success = true,
            message = "Doctor added successfully",
            data = result
        });
    }

    // ============================
    // GET ALL (SEARCH + FILTER + PAGINATION)
    // ============================
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _doctorService.GetAllDoctorsAsync(
            search,
            status,
            pageNumber,
            pageSize
        );

        if (result == null || !result.Any())
        {
            return NotFound(new
            {
                success = false,
                message = "No doctors found"
            });
        }

        return Ok(new
        {
            success = true,
            message = "Doctors fetched successfully",
            pageNumber,
            pageSize,
            data = result
        });
    }

    // ============================
    // GET BY ID
    // ============================
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

    // ============================
    // UPDATE DOCTOR
    // ============================
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDoctorDto dto)
    {
        var result = await _doctorService.UpdateDoctorAsync(id, dto);

        return Ok(new
        {
            success = true,
            message = "Doctor updated successfully",
            data = result
        });
    }

    // ============================
    // UPDATE STATUS
    // ============================
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var result = await _doctorService.UpdateStatusAsync(id, status);

        return Ok(new
        {
            success = true,
            message = "Doctor status updated successfully",
            data = result
        });
    }

    // ============================
    // DELETE (SOFT DELETE)
    // ============================
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _doctorService.DeleteDoctorAsync(id);

        if (!result)
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
            message = "Doctor deleted successfully"
        });
    }
}