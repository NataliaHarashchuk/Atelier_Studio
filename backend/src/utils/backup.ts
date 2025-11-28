import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUPS = Number(process.env.MAX_BACKUPS) || 10;

const parseDatabaseUrl = (url: string) => {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error("Invalid DATABASE_URL format");
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5].split("?")[0],
  };
};

export const ensureBackupDir = async (): Promise<void> => {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`Backup directory created: ${BACKUP_DIR}`);
  }
};

export const createBackup = async (): Promise<{
  filename: string;
  filepath: string;
  size: number;
  timestamp: Date;
}> => {
  await ensureBackupDir();

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const dbConfig = parseDatabaseUrl(DATABASE_URL);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -F c -b -v -f "${filepath}" ${dbConfig.database}`;

    await execAsync(command, {
      env: {
        ...process.env,
        PGPASSWORD: dbConfig.password
      }
    });

    const stats = await fs.stat(filepath);

    console.log(`Backup created successfully: ${filename}`);

    await cleanOldBackups();

    return {
      filename,
      filepath,
      size: stats.size,
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error("Backup creation failed:", error.message);
    throw new Error(`Backup creation failed: ${error.message}`);
  }
};

export const restoreBackup = async (filename: string): Promise<void> => {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const dbConfig = parseDatabaseUrl(DATABASE_URL);
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    await fs.access(filepath);

    const command = `PGPASSWORD="${dbConfig.password}" pg_restore -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c -v "${filepath}"`;

    await execAsync(command);

    console.log(`Database restored successfully from: ${filename}`);
  } catch (error: any) {
    console.error("Database restore failed:", error.message);
    throw new Error(`Database restore failed: ${error.message}`);
  }
};

export const listBackups = async (): Promise<
  {
    filename: string;
    size: number;
    created: Date;
  }[]
> => {
  await ensureBackupDir();

  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter((file) => file.endsWith(".sql"));

    const backups = await Promise.all(
      backupFiles.map(async (filename) => {
        const filepath = path.join(BACKUP_DIR, filename);
        const stats = await fs.stat(filepath);

        return {
          filename,
          size: stats.size,
          created: stats.birthtime,
        };
      }),
    );

    return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error: any) {
    console.error("Failed to list backups:", error.message);
    throw new Error(`Failed to list backups: ${error.message}`);
  }
};

export const deleteBackup = async (filename: string): Promise<void> => {
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    await fs.unlink(filepath);
    console.log(`Backup deleted: ${filename}`);
  } catch (error: any) {
    console.error("Failed to delete backup:", error.message);
    throw new Error(`Failed to delete backup: ${error.message}`);
  }
};

export const cleanOldBackups = async (): Promise<void> => {
  try {
    const backups = await listBackups();

    if (backups.length > MAX_BACKUPS) {
      const backupsToDelete = backups.slice(MAX_BACKUPS);

      for (const backup of backupsToDelete) {
        await deleteBackup(backup.filename);
      }

      console.log(`Cleaned ${backupsToDelete.length} old backup(s)`);
    }
  } catch (error: any) {
    console.error("Failed to clean old backups:", error.message);
  }
};

export const getBackupInfo = async (
  filename: string,
): Promise<{
  filename: string;
  filepath: string;
  size: number;
  created: Date;
}> => {
  const filepath = path.join(BACKUP_DIR, filename);

  try {
    const stats = await fs.stat(filepath);

    return {
      filename,
      filepath,
      size: stats.size,
      created: stats.birthtime,
    };
  } catch (error: any) {
    throw new Error(`Backup not found: ${filename}`);
  }
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};
