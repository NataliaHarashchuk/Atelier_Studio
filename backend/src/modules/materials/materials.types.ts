import { Material } from "@prisma/client";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export interface CreateMaterialDto {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export interface UpdateMaterialDto {
  name?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
}

export interface UpdateMaterialQuantityDto {
  quantity: number;
  operation: "add" | "subtract" | "set";
}

export interface MaterialResponse extends Material {
  totalValue: number;
}

export interface MaterialFilterParams {
  search?: string;
  unit?: string;
  minQuantity?: number;
  maxQuantity?: number;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface InventoryStats {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  byUnit: {
    unit: string;
    count: number;
    totalQuantity: number;
  }[];
}

export interface MaterialIdParams extends ParamsDictionary {
  id: string;
}

export interface MaterialsQueryParams {
  search?: string;
  unit?: string;
  minQuantity?: string;
  maxQuantity?: string;
  lowStock?: string;
  page?: string;
  limit?: string;
}

export type CreateMaterialRequest = Request<{}, {}, CreateMaterialDto>;
export type GetMaterialsRequest = Request<{}, {}, {}, MaterialsQueryParams>;
export type GetMaterialByIdRequest = Request<MaterialIdParams>;
export type UpdateMaterialRequest = Request<
  MaterialIdParams,
  {},
  UpdateMaterialDto
>;
export type UpdateMaterialQuantityRequest = Request<
  MaterialIdParams,
  {},
  UpdateMaterialQuantityDto
>;
export type DeleteMaterialRequest = Request<MaterialIdParams>;
