import { PoolConnection } from "mysql2/promise";
import { Counter } from "../types";
import logger from "../utils/logger";

async function getCounter(
  conn: PoolConnection,
  name: string
): Promise<Counter | null> {
  try {
    const [rows] = await conn.execute<Counter[]>(
      "SELECT current FROM counters WHERE name = ? FOR UPDATE",
      [name]
    );
    if (rows.length == 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function increaseCounter(
  conn: PoolConnection,
  count: number,
  name: string
) {
  try {
    await conn.execute("UPDATE counters SET current = ? WHERE name = ?", [
      count,
      name,
    ]);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
async function setUniqueCode(conn: PoolConnection, uniqueCode: string) {
  try {
    await conn.execute("INSERT INTO runner (code) VALUES (?)", [uniqueCode]);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default { getCounter, increaseCounter, setUniqueCode };
