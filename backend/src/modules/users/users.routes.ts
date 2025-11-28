import { Router } from "express";
import { UsersController } from "./users.controller";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/roleCheck.middleware.js";

const router = Router();
const usersController = new UsersController();

router.use(authenticate);
router.use(authorize(["ADMIN"]));

router.get("/", usersController.getAllUsers);

router.get("/:id", usersController.getUserById);

export default router;
