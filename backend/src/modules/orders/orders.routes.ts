import { Router } from "express";
import { OrdersController } from "./orders.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/roleCheck.middleware.js";
import upload from "../../middlewares/upload.middleware.js";
import {
  createOrderSchema,
  updateOrderSchema,
  updateOrderStatusSchema,
  getOrderByIdSchema,
  deleteOrderSchema,
  getOrdersSchema,
} from "./orders.validation.js";

const router = Router();
const ordersController = new OrdersController();

router.use(authenticate);

router.get(
  "/stats/overview",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  ordersController.getOrderStats,
);

router.get(
  "/upcoming-deadlines",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  ordersController.getUpcomingDeadlines,
);

router.get(
  "/overdue",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  ordersController.getOverdueOrders,
);

router.post(
  "/",
  authorize(["MANAGER", "ADMIN"]),
  upload.single("photo"),
  validate(createOrderSchema),
  ordersController.createOrder,
);

router.get(
  "/",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  validate(getOrdersSchema),
  ordersController.getOrders,
);

router.get(
  "/:id",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  validate(getOrderByIdSchema),
  ordersController.getOrderById,
);

router.patch(
  "/:id",
  authorize(["MANAGER", "ADMIN"]),
  upload.single("photo"),
  validate(updateOrderSchema),
  ordersController.updateOrder,
);

router.patch(
  "/:id/status",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  validate(updateOrderStatusSchema),
  ordersController.updateOrderStatus,
);

router.patch(
  "/:id/assign",
  authorize(["MANAGER", "ADMIN"]),
  ordersController.assignEmployee,
);

router.delete(
  "/:id",
  authorize(["ADMIN"]),
  validate(deleteOrderSchema),
  ordersController.deleteOrder,
);

export default router;
