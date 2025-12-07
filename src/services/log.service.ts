import pool from "../infra/db";
import logger from "../utils/logger";

async function storeLog(path: string) {
  try {
    await pool.execute("INSERT INTO request_logs (route) VALUES (?)", [path]);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default { storeLog };
