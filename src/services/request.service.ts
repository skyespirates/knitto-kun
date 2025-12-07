import pool from "../infra/db";
import { RequestPerHour } from "../types";
import logger from "../utils/logger";

async function getRequestPerHour(): Promise<RequestPerHour[] | null> {
  try {
    const query = `
            SELECT 
              DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour,
              COUNT(*) AS total_requests
            FROM request_logs
            GROUP BY hour
            ORDER BY hour DESC
          `;
    const [rows] = await pool.execute<RequestPerHour[]>(query);
    if (rows.length == 0) {
      return null;
    }
    return rows;
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default { getRequestPerHour };
