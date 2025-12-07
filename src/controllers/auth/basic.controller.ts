import { Request, Response } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/base-response";
import bcrypt from "bcrypt";
import userService from "../../services/user.service";
import logger from "../../utils/logger";
import jwt from "../../utils/jwt";
import { TokenPayload } from "../../types";

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await userService.getUserByEmail(email);
    if (user == null) {
      sendErrorResponse(res, "invalid email or password", 401);
      return;
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      sendErrorResponse(res, "invalid email or password", 401);
      return;
    }
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
    };
    const token = jwt.generateToken(payload);
    sendSuccessResponse(res, "success", { access_token: token });
  } catch (error) {
    sendErrorResponse(res, "failed to login", 501);
    logger.error(error);
  }
};

export default {
  login,
};
