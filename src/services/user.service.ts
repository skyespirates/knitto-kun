import { User } from "../types";
import pool from "../infra/db";
import logger from "../utils/logger";

async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const [rows] = await pool.execute<User[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
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

async function create(username: string, email: string, password: string) {
  try {
    await pool.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default {
  getUserByEmail,
  create,
};
