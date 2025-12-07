import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

import { StatusCodes } from "http-status-codes";
import pool from "../infra/db";
import { sendErrorResponse } from "../utils/base-response";
import jwt from "jsonwebtoken";

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

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secret_key = process.env.JWT_SECRET;
  if (!secret_key) {
    throw new Error("JWT_SECRET is not set");
  }
  const token = req.header("Authorization")?.split(" ")[1];
  if (token) {
    jwt.verify(token, secret_key, (err, user) => {
      if (err) {
        sendErrorResponse(res, "invalid token", 401);
        return;
      }
      req.user = user;
      next();
    });
  } else {
    sendErrorResponse(res, "invalid token", 401);
  }
}

export async function logRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await pool.execute("INSERT INTO request_logs (route) VALUES (?)", [
      req.path,
    ]);
  } catch (error) {
    sendErrorResponse(res, "failed to save log");
  }
  next();
}
