import { Router } from "express";
import { ClientsController } from "./сlients.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/roleCheck.middleware.js";
import {
  createClientSchema,
  updateClientSchema,
  getClientByIdSchema,
  deleteClientSchema,
  getClientsSchema,
} from "./clients.validation.js";

const router = Router();
const clientsController = new ClientsController();

router.use(authenticate);

router.post(
  "/",
  authorize(["MANAGER", "ADMIN"]),
  validate(createClientSchema),
  clientsController.createClient,
);

router.get(
  "/",
  authorize(["MANAGER", "ADMIN"]),
  validate(getClientsSchema),
  clientsController.getClients,
);

router.get(
  "/:id",
  authorize(["MANAGER", "ADMIN"]),
  validate(getClientByIdSchema),
  clientsController.getClientById,
);

router.get(
  "/:id/details",
  authorize(["MANAGER", "ADMIN"]),
  validate(getClientByIdSchema),
  clientsController.getClientWithOrders,
);

router.get(
  "/:id/stats",
  authorize(["MANAGER", "ADMIN"]),
  validate(getClientByIdSchema),
  clientsController.getClientStats,
);

router.patch(
  "/:id",
  authorize(["MANAGER", "ADMIN"]),
  validate(updateClientSchema),
  clientsController.updateClient,
);

router.delete(
  "/:id",
  authorize(["ADMIN"]),
  validate(deleteClientSchema),
  clientsController.deleteClient,
);

export default router;
