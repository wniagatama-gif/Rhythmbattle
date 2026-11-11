import { checkDatabaseConnection, connectionPool } from "./index";

async function main() {
  console.log("Testing database connection...");
  const result = await checkDatabaseConnection();
  if (result.connected) {
    console.log("Database connection successful!");
  } else {
    console.warn("Database connection notice:", result.error);
    console.log("Make sure MySQL is running in Laragon (Port 3306).");
  }
  await connectionPool.end();
  process.exit(result.connected ? 0 : 1);
}

main();

