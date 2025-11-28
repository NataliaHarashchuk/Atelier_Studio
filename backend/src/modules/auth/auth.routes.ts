import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/roleCheck.middleware.js";
import {
  loginSchema,
  changePasswordSchema,
  updateUserRoleSchema,
  deleteUserSchema,
} from "./auth.validation.js";

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/login
 * @desc    Логін користувача
 * @access  Public
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Отримати поточного користувача
 * @access  Private
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @route   PATCH /api/auth/change-password
 * @desc    Змінити пароль
 * @access  Private
 */
router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (на клієнті видалити токен)
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   PATCH /api/auth/users/:id/role
 * @desc    Оновити роль користувача
 * @access  Admin
 */
router.patch(
  "/users/:id/role",
  authenticate,
  authorize(["ADMIN"]),
  validate(updateUserRoleSchema),
  authController.updateUserRole,
);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Видалити користувача
 * @access  Admin
 */
router.delete(
  "/users/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate(deleteUserSchema),
  authController.deleteUser,
);

export default router;
