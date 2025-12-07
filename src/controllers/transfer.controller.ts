import { Request, Response } from "express";
import pool from "../infra/db";
import logger from "../utils/logger";
import { sendErrorResponse, sendSuccessResponse } from "../utils/base-response";
import accountService from "../services/account.service";
import transactionService from "../services/transaction.service";

async function transfer(req: Request, res: Response) {
  const { senderId, receiverId, amount } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const cash = await accountService.getBalance(conn, senderId);
    if (cash == null) {
      sendErrorResponse(res, "invalid sender id");
      return;
    }

    if (cash.balance < amount) {
      sendErrorResponse(res, "insufficient balance");
      return;
    }

    await accountService.updateSender(conn, amount, senderId);

    await accountService.updateReceiver(conn, amount, receiverId);

    await transactionService.logTransaction(conn, senderId, receiverId, amount);

    await conn.commit();

    sendSuccessResponse(res, "transfer successfully");
  } catch (error) {
    await conn.rollback();
    logger.error(error);
    sendErrorResponse(res, "transfer failed", 501);
  } finally {
    conn.release();
  }
}

export default { transfer };
