import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided. Please login.", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided. Please login.", 401);
    }

    try {
      const decoded = verifyToken(token);

      if (decoded.role === "GUEST") {
        throw new AppError(
          "Доступ заборонено. Гостьовий доступ не дозволений.",
          403,
        );
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token expired. Please login again.", 401);
      } else if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid token. Please login again.", 401);
      } else {
        throw new AppError("Authentication failed.", 401);
      }
    }
  } catch (error) {
    next(error);
  }
};
