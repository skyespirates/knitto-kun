import pool from "../infra/db";
import { Balance } from "../types";
import logger from "../utils/logger";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

async function createAccount(id: string, name: string) {
  try {
    await pool.execute("INSERT INTO accounts (id, name) VALUES (?, ?)", [
      id,
      name,
    ]);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function getBalance(
  conn: PoolConnection,
  accountId: string
): Promise<Balance | null> {
  try {
    const [balances] = await conn.query<Balance[]>(
      "SELECT balance FROM accounts WHERE id = ?",
      [accountId]
    );
    if (balances.length == 0) {
      return null;
    }
    return balances[0];
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function updateSender(
  conn: PoolConnection,
  amount: number,
  senderId: string
) {
  try {
    const [result] = await conn.query<ResultSetHeader>(
      "UPDATE accounts SET balance = balance - ? WHERE id = ?",
      [amount, senderId]
    );
    if (result.affectedRows == 0) {
      throw new Error("sender account not found");
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function updateReceiver(
  conn: PoolConnection,
  amount: number,
  receiverId: string
) {
  try {
    const [result] = await conn.query<ResultSetHeader>(
      "UPDATE accounts SET balance = balance + ? WHERE id = ?",
      [amount, receiverId]
    );

    if (result.affectedRows == 0) {
      throw new Error("receiver account not found");
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default { createAccount, getBalance, updateSender, updateReceiver };
