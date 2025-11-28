import { Request, Response } from "express";
import { OrdersService } from "./orders.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { OrderStatus, OrderType } from "@prisma/client";

const ordersService = new OrdersService();

export class OrdersController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const photoPath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const order = await ordersService.createOrder(req.body, photoPath);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  });

  getOrders = asyncHandler(async (req: Request, res: Response) => {
    const {
      search,
      status,
      type,
      clientId,
      assignedEmployeeId,
      deadlineFrom,
      deadlineTo,
      minPrice,
      maxPrice,
      page,
      limit,
    } = req.query;

    let filterEmployeeId = assignedEmployeeId
      ? Number(assignedEmployeeId)
      : undefined;

    if (req.user?.role === "MASTER") {
      const { prisma } = await import("../../server.js");
      const employee = await prisma.employee.findUnique({
        where: { userId: req.user.id },
      });

      if (employee) {
        filterEmployeeId = employee.id;
      }
    }

    const result = await ordersService.getOrders({
      search: search as string | undefined,
      status: status as OrderStatus | undefined,
      type: type as OrderType | undefined,
      clientId: clientId ? Number(clientId) : undefined,
      assignedEmployeeId: filterEmployeeId,
      deadlineFrom: deadlineFrom ? new Date(deadlineFrom as string) : undefined,
      deadlineTo: deadlineTo ? new Date(deadlineTo as string) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const order = await ordersService.getOrderById(Number(id));

    if (req.user?.role === "MASTER") {
      const { prisma } = await import("../../server.js");
      const employee = await prisma.employee.findUnique({
        where: { userId: req.user.id },
      });

      if (employee && order.assignedEmployee?.id !== employee.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden. You can only view your own orders.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  });

  updateOrder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const order = await ordersService.updateOrder(
      Number(id),
      req.body,
      photoPath,
    );

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (req.user?.role === "MASTER") {
      const { prisma } = await import("../../server.js");
      const [order, employee] = await Promise.all([
        prisma.order.findUnique({ where: { id: Number(id) } }),
        prisma.employee.findUnique({ where: { userId: req.user.id } }),
      ]);

      if (!order || !employee || order.assignedEmployeeId !== employee.id) {
        return res.status(403).json({
          success: false,
          message: "Forbidden. You can only update status of your own orders.",
        });
      }
    }

    const order = await ordersService.updateOrderStatus(Number(id), req.body);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  });

  assignEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { employeeId } = req.body;

    const order = await ordersService.assignEmployee(Number(id), employeeId);

    res.status(200).json({
      success: true,
      message: "Employee assigned successfully",
      data: order,
    });
  });

  deleteOrder = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await ordersService.deleteOrder(Number(id));

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  });

  getOrderStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await ordersService.getOrderStats(req.user!);

    res.status(200).json({
      success: true,
      message: "Статистика замовлень отримана",
      data: stats,
    });
  });

  getUpcomingDeadlines = asyncHandler(async (req: Request, res: Response) => {
    const orders = await ordersService.getUpcomingDeadlines(req.user!);

    res.status(200).json({
      success: true,
      message: "Замовлення з наближеним дедлайном отримані",
      data: orders,
    });
  });

  getOverdueOrders = asyncHandler(async (req: Request, res: Response) => {
    const orders = await ordersService.getOverdueOrders(req.user!);

    res.status(200).json({
      success: true,
      message: "Прострочені замовлення отримані",
      data: orders,
    });
  });
}
