import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { UserRole } from "@prisma/client";
import { AppError } from "../../middlewares/errorHandler.js";

const authService = new AuthService();

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    if (result.user.role === "GUEST") {
      throw new AppError(
        "Доступ заборонено. Гостьовий доступ не дозволений.",
        403,
      );
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;

    await authService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  });

  updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    await authService.updateUserRole(Number(id), role as UserRole);

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
    });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await authService.deleteUser(Number(id));

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  });
}
