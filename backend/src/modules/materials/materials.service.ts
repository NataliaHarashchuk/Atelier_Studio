import { prisma } from "../../server.js";
import { AppError } from "../../middlewares/errorHandler.js";
import {
  CreateMaterialDto,
  UpdateMaterialDto,
  UpdateMaterialQuantityDto,
  MaterialResponse,
  MaterialFilterParams,
  InventoryStats,
} from "./materials.types.js";
import { PaginatedResponse } from "../../types/common.types.js";
import { Prisma } from "@prisma/client";

export class MaterialsService {
  private readonly LOW_STOCK_THRESHOLD = 10;

  async createMaterial(data: CreateMaterialDto): Promise<MaterialResponse> {
    const existingMaterial = await prisma.material.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    });

    if (existingMaterial) {
      throw new AppError("Material with this name already exists", 409);
    }

    const material = await prisma.material.create({
      data: {
        name: data.name,
        quantity: new Prisma.Decimal(data.quantity),
        unit: data.unit,
        pricePerUnit: new Prisma.Decimal(data.pricePerUnit),
      },
    });

    return this.calculateTotalValue(material);
  }

  async getMaterials(
    params: MaterialFilterParams,
  ): Promise<PaginatedResponse<MaterialResponse>> {
    const {
      search,
      unit,
      minQuantity,
      maxQuantity,
      lowStock,
      page = 1,
      limit = 10,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (unit) {
      where.unit = unit;
    }

    if (minQuantity !== undefined || maxQuantity !== undefined) {
      where.quantity = {};
      if (minQuantity !== undefined) {
        where.quantity.gte = new Prisma.Decimal(minQuantity);
      }
      if (maxQuantity !== undefined) {
        where.quantity.lte = new Prisma.Decimal(maxQuantity);
      }
    }

    if (lowStock) {
      where.quantity = {
        ...where.quantity,
        lt: new Prisma.Decimal(this.LOW_STOCK_THRESHOLD),
      };
    }

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.material.count({ where }),
    ]);

    const materialsWithValue = materials.map(this.calculateTotalValue);

    return {
      data: materialsWithValue,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMaterialById(id: number): Promise<MaterialResponse> {
    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new AppError("Material not found", 404);
    }

    return this.calculateTotalValue(material);
  }

  async updateMaterial(
    id: number,
    data: UpdateMaterialDto,
  ): Promise<MaterialResponse> {
    const existingMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      throw new AppError("Material not found", 404);
    }

    if (data.name) {
      const nameExists = await prisma.material.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          NOT: { id },
        },
      });

      if (nameExists) {
        throw new AppError("Material with this name already exists", 409);
      }
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.quantity !== undefined && {
          quantity: new Prisma.Decimal(data.quantity),
        }),
        ...(data.unit && { unit: data.unit }),
        ...(data.pricePerUnit !== undefined && {
          pricePerUnit: new Prisma.Decimal(data.pricePerUnit),
        }),
      },
    });

    return this.calculateTotalValue(updatedMaterial);
  }

  async updateMaterialQuantity(
    id: number,
    data: UpdateMaterialQuantityDto,
  ): Promise<MaterialResponse> {
    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new AppError("Material not found", 404);
    }

    let newQuantity: Prisma.Decimal;
    const currentQuantity = Number(material.quantity);
    const changeQuantity = data.quantity;

    switch (data.operation) {
      case "add":
        newQuantity = new Prisma.Decimal(currentQuantity + changeQuantity);
        break;
      case "subtract":
        const resultQuantity = currentQuantity - changeQuantity;
        if (resultQuantity < 0) {
          throw new AppError("Insufficient material quantity", 400);
        }
        newQuantity = new Prisma.Decimal(resultQuantity);
        break;
      case "set":
        if (changeQuantity < 0) {
          throw new AppError("Quantity cannot be negative", 400);
        }
        newQuantity = new Prisma.Decimal(changeQuantity);
        break;
      default:
        throw new AppError("Invalid operation", 400);
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    return this.calculateTotalValue(updatedMaterial);
  }

  async deleteMaterial(id: number): Promise<void> {
    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new AppError("Material not found", 404);
    }

    await prisma.material.delete({
      where: { id },
    });
  }

  async getInventoryStats(): Promise<InventoryStats> {
    const [materials, lowStockCount] = await Promise.all([
      prisma.material.findMany(),
      prisma.material.count({
        where: {
          quantity: {
            lt: new Prisma.Decimal(this.LOW_STOCK_THRESHOLD),
          },
        },
      }),
    ]);

    const totalValue = materials.reduce((sum, material) => {
      return sum + Number(material.quantity) * Number(material.pricePerUnit);
    }, 0);

    const byUnit = materials.reduce(
      (acc, material) => {
        const unit = material.unit;
        const existing = acc.find((item) => item.unit === unit);

        if (existing) {
          existing.count++;
          existing.totalQuantity += Number(material.quantity);
        } else {
          acc.push({
            unit,
            count: 1,
            totalQuantity: Number(material.quantity),
          });
        }

        return acc;
      },
      [] as { unit: string; count: number; totalQuantity: number }[],
    );

    return {
      totalMaterials: materials.length,
      totalValue: Math.round(totalValue * 100) / 100,
      lowStockItems: lowStockCount,
      byUnit: byUnit.sort((a, b) => b.count - a.count),
    };
  }

  async getLowStockMaterials(): Promise<MaterialResponse[]> {
    const materials = await prisma.material.findMany({
      where: {
        quantity: {
          lt: new Prisma.Decimal(this.LOW_STOCK_THRESHOLD),
        },
      },
      orderBy: { quantity: "asc" },
    });

    return materials.map(this.calculateTotalValue);
  }

  private calculateTotalValue(material: any): MaterialResponse {
    const totalValue =
      Number(material.quantity) * Number(material.pricePerUnit);

    return {
      ...material,
      totalValue: Math.round(totalValue * 100) / 100,
    };
  }
}
