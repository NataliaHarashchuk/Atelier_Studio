import { Router } from "express";
import { MaterialsController } from "./materials.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/roleCheck.middleware.js";
import {
  createMaterialSchema,
  updateMaterialSchema,
  updateMaterialQuantitySchema,
  getMaterialByIdSchema,
  deleteMaterialSchema,
  getMaterialsSchema,
} from "./materials.validation.js";

const router = Router();
const materialsController = new MaterialsController();

router.use(authenticate);

router.get(
  "/stats/inventory",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  materialsController.getInventoryStats,
);

router.get(
  "/low-stock",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  materialsController.getLowStockMaterials,
);

router.post(
  "/",
  authorize(["MANAGER", "ADMIN"]),
  validate(createMaterialSchema),
  materialsController.createMaterial,
);

router.get(
  "/",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  validate(getMaterialsSchema),
  materialsController.getMaterials,
);

router.get(
  "/:id",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  validate(getMaterialByIdSchema),
  materialsController.getMaterialById,
);

router.patch(
  "/:id",
  authorize(["MANAGER", "ADMIN"]),
  validate(updateMaterialSchema),
  materialsController.updateMaterial,
);

router.patch(
  "/:id/quantity",
  authorize(["MANAGER", "ADMIN"]),
  validate(updateMaterialQuantitySchema),
  materialsController.updateMaterialQuantity,
);

router.delete(
  "/:id",
  authorize(["ADMIN"]),
  validate(deleteMaterialSchema),
  materialsController.deleteMaterial,
);

export default router;
