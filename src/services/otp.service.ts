import pool from "../infra/db";
import logger from "../utils/logger";
import { OTP } from "../types";

async function create(userId: number, kodeOtp: string, expiresAt: Date) {
  try {
    await pool.execute(
      "INSERT INTO otp_codes (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
      [userId, kodeOtp, expiresAt]
    );
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

async function check(userId: number, kodeOtp: string): Promise<OTP | null> {
  try {
    const [rows] = await pool.execute<OTP[]>(
      "SELECT * FROM otp_codes WHERE user_id = ? AND otp_code = ? and expires_at > NOW() and used = 0 ORDER BY id LIMIT 1",
      [userId, kodeOtp]
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

async function invalidate(id: number) {
  try {
    await pool.execute("UPDATE otp_codes SET used = 1 WHERE id = ?", [id]);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export default {
  create,
  check,
  invalidate,
};
