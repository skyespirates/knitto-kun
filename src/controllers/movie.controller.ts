import { Request, Response } from "express";
import client from "../utils/axios";
import { sendSuccessResponse, sendErrorResponse } from "../utils/base-response";
import logger from "../utils/logger";

async function getMovies(req: Request, res: Response) {
  try {
    const result = await client.get("/discover/movie", {
      params: {
        include_adult: false,
        include_video: false,
        language: "en-US",
        page: 2,
        sort_by: "popularity.desc",
      },
    });
    sendSuccessResponse(res, "success", {
      ...result.data,
    });
  } catch (error) {
    logger.error(error);
    sendErrorResponse(res, "error");
  }
}

export default { getMovies };
