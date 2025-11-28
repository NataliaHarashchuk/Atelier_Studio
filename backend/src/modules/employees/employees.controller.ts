import { Request, Response } from "express";
import { EmployeesService } from "./employees.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { UserRole } from "@prisma/client";

const employeesService = new EmployeesService();

export class EmployeesController {
  createEmployee = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.createEmployee(req.body);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  });

  createAccountForEmployee = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const { password, role } = req.body;

      const employee = await employeesService.createAccountForEmployee(
        Number(id),
        password,
        role as UserRole,
      );

      res.status(201).json({
        success: true,
        message: "Account created successfully for employee",
        data: employee,
      });
    },
  );

  getEmployees = asyncHandler(async (req: Request, res: Response) => {
    const { search, position, hasAccount, page, limit } = req.query;

    const result = await employeesService.getEmployees({
      search: search as string | undefined,
      position: position as string | undefined,
      hasAccount:
        hasAccount === "true"
          ? true
          : hasAccount === "false"
            ? false
            : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  });

  getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const employee = await employeesService.getEmployeeById(Number(id));

    res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
      data: employee,
    });
  });

  getEmployeeWithOrders = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const employee = await employeesService.getEmployeeWithOrders(Number(id));

    res.status(200).json({
      success: true,
      message: "Employee orders retrieved successfully",
      data: employee,
    });
  });

  getEmployeeStats = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const stats = await employeesService.getEmployeeStats(Number(id));

    res.status(200).json({
      success: true,
      message: "Employee statistics retrieved successfully",
      data: stats,
    });
  });

  updateEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const employee = await employeesService.updateEmployee(
      Number(id),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  });

  deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await employeesService.deleteEmployee(Number(id));

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  });
}
