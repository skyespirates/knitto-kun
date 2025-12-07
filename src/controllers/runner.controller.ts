import { Request, Response } from "express";
import { sendErrorResponse, sendSuccessResponse } from "../utils/base-response";
import pool from "../infra/db";
import runnerService from "../services/runner.service";
import logger from "../utils/logger";

async function generateRunnerCode(req: Request, res: Response) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const counter = await runnerService.getCounter(conn, "invoice");
    if (counter == null) {
      sendErrorResponse(res, "counter not found");
      return;
    }

    const lastNumber = counter.current;
    const nextNumber = lastNumber + 1;

    await runnerService.increaseCounter(conn, nextNumber, "invoice");

    const code = nextNumber.toString().padStart(4, "0");
    const uniqueCode = `INV-${code}`;

    await runnerService.setUniqueCode(conn, uniqueCode);

    await conn.commit();
    sendSuccessResponse(res, "code generated successfully", {
      code: uniqueCode,
    });
  } catch (error) {
    await conn.rollback();
    logger.error(error);
    sendErrorResponse(res, "failed to generate runner");
  } finally {
    conn.release();
  }
}

export default { generateRunnerCode };
