import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

import { StatusCodes } from "http-status-codes";
import { conn } from "../infra/db";
import { sendErrorResponse } from "../utils/base-response";

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Invalid data", details: errorMessages });
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Internal Server Error" });
      }
    }
  };
}

export async function logRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await conn.execute("INSERT INTO request_logs (route) VALUES (?)", [
      req.path,
    ]);
  } catch (error) {
    sendErrorResponse(res, "failed to save log");
  }
  next();
}
