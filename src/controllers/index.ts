import { Request, Response } from "express";
import { conn } from "../infra/db";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

import { sendSuccessResponse, sendErrorResponse } from "../utils/base-response";
import logger from "../utils/logger";

const saltRounds = 10;

const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const hashed_password = await bcrypt.hash(password, saltRounds);
    let query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    await conn.execute(query, [username, email, hashed_password]);
    sendSuccessResponse(res, "registered successfully");
  } catch (error) {
    sendErrorResponse(res, "failed to register", 500);
  }
};

interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
}

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await conn.execute<User[]>(query, [email]);
    let isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      throw new Error("invalid email of password");
    }
    sendSuccessResponse(res, "users", rows);
  } catch (error) {
    sendErrorResponse(res, "failed to login", 501);
    logger.error(error);
  }
};

export default { registerUser, loginUser };
