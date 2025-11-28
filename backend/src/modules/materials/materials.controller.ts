import { Request, Response } from "express";
import { MaterialsService } from "./materials.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const materialsService = new MaterialsService();

export class MaterialsController {
  createMaterial = asyncHandler(async (req: Request, res: Response) => {
    const material = await materialsService.createMaterial(req.body);

    res.status(201).json({
      success: true,
      message: "Material created successfully",
      data: material,
    });
  });

  getMaterials = asyncHandler(async (req: Request, res: Response) => {
    const { search, unit, minQuantity, maxQuantity, lowStock, page, limit } =
      req.query;

    const result = await materialsService.getMaterials({
      search: search as string | undefined,
      unit: unit as string | undefined,
      minQuantity: minQuantity ? Number(minQuantity) : undefined,
      maxQuantity: maxQuantity ? Number(maxQuantity) : undefined,
      lowStock: lowStock === "true",
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.status(200).json({
      success: true,
      message: "Materials retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  });

  getMaterialById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const material = await materialsService.getMaterialById(Number(id));

    res.status(200).json({
      success: true,
      message: "Material retrieved successfully",
      data: material,
    });
  });

  updateMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const material = await materialsService.updateMaterial(
      Number(id),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Material updated successfully",
      data: material,
    });
  });

  updateMaterialQuantity = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const material = await materialsService.updateMaterialQuantity(
      Number(id),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Material quantity updated successfully",
      data: material,
    });
  });

  deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await materialsService.deleteMaterial(Number(id));

    res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  });

  getInventoryStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await materialsService.getInventoryStats();

    res.status(200).json({
      success: true,
      message: "Inventory statistics retrieved successfully",
      data: stats,
    });
  });

  getLowStockMaterials = asyncHandler(async (_req: Request, res: Response) => {
    const materials = await materialsService.getLowStockMaterials();

    res.status(200).json({
      success: true,
      message: "Low stock materials retrieved successfully",
      data: materials,
    });
  });
}
