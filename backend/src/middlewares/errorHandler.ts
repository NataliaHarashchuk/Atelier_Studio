import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { ValidationError } from "../types/common.types.js";

export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
): AppError => {
  switch (error.code) {
    case "P2002": {
      const field = (error.meta?.target as string[])[0] || "field";
      return new AppError(`${field} already exists`, 409);
    }
    case "P2025":
      return new AppError("Record not found", 404);
    case "P2003":
      return new AppError("Related record not found", 404);
    case "P2014":
      return new AppError("Invalid ID provided", 400);
    default:
      return new AppError("Database error occurred", 500);
  }
};

const handleZodError = (
  error: ZodError,
): {
  statusCode: number;
  status: string;
  message: string;
  errors: ValidationError[];
} => {
  const errors: ValidationError[] = error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return {
    statusCode: 400,
    status: "fail",
    message: "Validation failed",
    errors,
  };
};

const handleJWTError = (): AppError => {
  return new AppError("Invalid token. Please log in again", 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError("Token expired. Please log in again", 401);
};

const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR", err);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong",
    });
  }
};

const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error = err as AppError;

  if (!(err instanceof AppError)) {
    error = new AppError(err.message || "Internal server error", 500);
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
    return;
  }

  let modifiedError = { ...error };
  modifiedError.message = error.message;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    modifiedError = handlePrismaError(err);
  }

  if (err instanceof ZodError) {
    const zodError = handleZodError(err);
    res.status(zodError.statusCode).json({
      success: false,
      status: zodError.status,
      message: zodError.message,
      errors: zodError.errors,
    });
    return;
  }

  if (err.name === "JsonWebTokenError") {
    modifiedError = handleJWTError();
  }

  if (err.name === "TokenExpiredError") {
    modifiedError = handleJWTExpiredError();
  }

  sendErrorProd(modifiedError, res);
};

export default errorHandler;
