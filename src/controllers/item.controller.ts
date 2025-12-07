import { Request, Response } from "express";
import { sendSuccessResponse } from "../utils/base-response";

function getItems(req: Request, res: Response) {
  const items = [
    { id: 1, name: "item1" },
    { id: 2, name: "item2" },
    { id: 3, name: "item3" },
  ];
  sendSuccessResponse(res, "get items", { items });
}

function createItem(req: Request, res: Response) {
  const { name } = req.body;
  sendSuccessResponse(res, "item created successfully", {
    item: { id: 4, name },
  });
}

export default { getItems, createItem };
