import { Router } from "express";
import { EmployeesController } from "./employees.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/roleCheck.middleware.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeeByIdSchema,
  deleteEmployeeSchema,
  getEmployeesSchema,
  createAccountForEmployeeSchema,
} from "./employees.validation.js";

const router = Router();
const employeesController = new EmployeesController();

router.use(authenticate);

router.post(
  "/",
  authorize(["MANAGER", "ADMIN"]),
  validate(createEmployeeSchema),
  employeesController.createEmployee,
);

router.post(
  "/:id/account",
  authorize(["MANAGER", "ADMIN"]),
  validate(createAccountForEmployeeSchema),
  employeesController.createAccountForEmployee,
);

router.get(
  "/",
  authorize(["MANAGER", "ADMIN"]),
  validate(getEmployeesSchema),
  employeesController.getEmployees,
);

router.get(
  "/:id",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  validate(getEmployeeByIdSchema),
  employeesController.getEmployeeById,
);

router.get(
  "/:id/orders",
  authorize(["MANAGER", "ADMIN", "MASTER"]),
  validate(getEmployeeByIdSchema),
  employeesController.getEmployeeWithOrders,
);

router.get(
  "/:id/stats",
  authorize(["MANAGER", "ADMIN"]),
  validate(getEmployeeByIdSchema),
  employeesController.getEmployeeStats,
);

router.patch(
  "/:id",
  authorize(["MANAGER", "ADMIN"]),
  validate(updateEmployeeSchema),
  employeesController.updateEmployee,
);

router.delete(
  "/:id",
  authorize(["ADMIN"]),
  validate(deleteEmployeeSchema),
  employeesController.deleteEmployee,
);

export default router;
