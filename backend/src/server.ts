import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";
import errorHandler from "./middlewares/errorHandler.js";
import { ensureBackupDir } from "./utils/backup.js";
import { setupBackupScheduler } from "./utils/scheduler.js";

dotenv.config();

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

import authRoutes from "./modules/auth/auth.routes.js";
import clientsRoutes from "./modules/clients/clients.routes.js";
import materialsRoutes from "./modules/materials/materials.routes.js";
import employeesRoutes from "./modules/employees/employees.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/orders", ordersRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || "5000", 10);

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    await ensureBackupDir();

    const backupTask = setupBackupScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    (global as any).backupTask = backupTask;
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
  try {
    const backupTask = (global as any).backupTask;
    if (backupTask) {
      backupTask.stop();
      console.log("Backup scheduler stopped");
    }

    await prisma.$disconnect();
    console.log("Database disconnected");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason: any) => {
  console.error("Unhandled Rejection:", reason);
  gracefulShutdown("Unhandled Rejection");
});

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("Uncaught Exception");
});

startServer();
