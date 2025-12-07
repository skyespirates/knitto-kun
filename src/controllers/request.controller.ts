import { Request, Response } from "express";
import requestService from "../services/request.service";
import { sendErrorResponse, sendSuccessResponse } from "../utils/base-response";

async function getRequestPerHour(req: Request, res: Response) {
  try {
    const rph = await requestService.getRequestPerHour();
    if (rph == null) {
      sendErrorResponse(res, "request cannot processed");
      return;
    }

    sendSuccessResponse(res, "request per hour", { rph });
  } catch (error) {
    sendErrorResponse(res, "an error occured");
  }
}

export default { getRequestPerHour };
