import { Request, Response } from "express";
import { sendSuccessResponse, sendErrorResponse } from "../utils/base-response";
import bcrypt from "bcrypt";
import userService from "../services/user.service";

async function register(req: Request, res: Response) {
  const { username, email, password } = req.body;

  try {
    const hashed_password = await bcrypt.hash(password, 10);
    await userService.create(username, email, hashed_password);
    sendSuccessResponse(res, "registered successfully");
  } catch (error) {
    sendErrorResponse(res, "failed to register", 500);
  }
}

export default {
  register,
};
