import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { config } from "../config";
import * as schema from "./schema";

export const connectionPool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(connectionPool, { schema, mode: "default" });

export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, error: message };
  }
}

