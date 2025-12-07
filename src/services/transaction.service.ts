import logger from "../utils/logger";
import { PoolConnection } from "mysql2/promise";

async function logTransaction(
  conn: PoolConnection,
  senderId: string,
  receiverId: string,
  amount: number
) {
  try {
    await conn.query(
      "INSERT INTO transactions (sender_id, receiver_id, amount) VALUES (?, ?, ?)",
      [senderId, receiverId, amount]
    );
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default { logTransaction };
