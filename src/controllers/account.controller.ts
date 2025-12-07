import { Request, Response } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/base-response";
import logger from "../utils/logger";
import accountService from "../services/account.service";
import { v4 as uuidv4 } from "uuid";

async function createAccount(req: Request, res: Response) {
  const { name } = req.body;
  try {
    const id = uuidv4();
    await accountService.createAccount(id, name);
    sendSuccessResponse(res, "account created successfully", { id });
  } catch (error) {
    logger.error(error);
    sendErrorResponse(res, "failed to create account", 501);
  }
}

export default {
  createAccount,
};
