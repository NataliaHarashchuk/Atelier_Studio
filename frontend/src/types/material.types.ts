export type MaterialUnit =
  | "м"
  | "шт"
  | "кг"
  | "л"
  | "м²"
  | "м³"
  | "пог.м"
  | "компл";

export interface Material {
  id: number;
  name: string;
  quantity: number;
  unit: MaterialUnit;
  pricePerUnit: number;
  createdAt: string;
  updatedAt: string;
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

export interface CreateMaterialData {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export interface UpdateMaterialData {
  name?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
}

export interface UpdateQuantityData {
  quantity: number;
  operation: "add" | "subtract" | "set";
}

export interface InventoryStats {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  byUnit: Array<{
    unit: string;
    count: number;
    totalQuantity: number;
  }>;
}
