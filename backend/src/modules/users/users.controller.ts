import { Request, Response } from "express";
import { UsersService } from "./users.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const usersService = new UsersService();

export class UsersController {
  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, role } = req.query;

    const result = await usersService.getAllUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      role: role as string | undefined,
    });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await usersService.getUserById(Number(id));

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  });
}
