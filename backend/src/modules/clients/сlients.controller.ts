import { Request, Response } from "express";
import { ClientsService } from "./clients.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const clientsService = new ClientsService();

export class ClientsController {
  createClient = asyncHandler(async (req: Request, res: Response) => {
    const client = await clientsService.createClient(req.body);

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  });

  getClients = asyncHandler(async (req: Request, res: Response) => {
    const { search, page, limit } = req.query;

    const result = await clientsService.getClients({
      search: search as string | undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.status(200).json({
      success: true,
      message: "Clients retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  });

  getClientById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const client = await clientsService.getClientById(Number(id));

    res.status(200).json({
      success: true,
      message: "Client retrieved successfully",
      data: client,
    });
  });

  getClientWithOrders = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const client = await clientsService.getClientWithOrders(Number(id));

    res.status(200).json({
      success: true,
      message: "Client details retrieved successfully",
      data: client,
    });
  });

  getClientStats = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const stats = await clientsService.getClientStats(Number(id));

    res.status(200).json({
      success: true,
      message: "Client statistics retrieved successfully",
      data: stats,
    });
  });

  updateClient = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const client = await clientsService.updateClient(Number(id), req.body);

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: client,
    });
  });

  deleteClient = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await clientsService.deleteClient(Number(id));

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  });
}
