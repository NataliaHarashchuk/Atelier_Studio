import cron from "node-cron";
import { createBackup } from "./backup.js";

export const setupBackupScheduler = () => {
  const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || "0 2 * * *";
  const AUTO_BACKUP_ENABLED = process.env.AUTO_BACKUP_ENABLED === "true";

  if (!AUTO_BACKUP_ENABLED) {
    console.log("Automatic backup is disabled");
    return null;
  }

  if (!cron.validate(BACKUP_SCHEDULE)) {
    console.error("Invalid BACKUP_SCHEDULE cron expression");
    return null;
  }

  const task = cron.schedule(
    BACKUP_SCHEDULE,
    async () => {
      console.log("Starting automatic backup...");
      try {
        const backup = await createBackup();
        console.log(`Automatic backup completed: ${backup.filename}`);
      } catch (error: any) {
        console.error("Automatic backup failed:", error.message);
      }
    },
    {
      timezone: process.env.TZ || "Europe/Kiev",
    },
  );

  task.start();

  console.log(`Automatic backup scheduler started`);
  console.log(`Schedule: ${BACKUP_SCHEDULE}`);
  console.log(`Timezone: ${process.env.TZ || "Europe/Kiev"}`);

  return task;
};

export const stopBackupScheduler = (
  task: ReturnType<typeof cron.schedule> | null,
) => {
  if (task) {
    task.stop();
    console.log("Backup scheduler stopped");
  }
};
