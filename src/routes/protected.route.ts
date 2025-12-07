import { Router } from "express";
import ctl from "../controllers/item.controller";
import { validateData } from "../middlewares";
import { itemSchema } from "../schemas";

const router = Router();

router.get("/items", ctl.getItems);
router.post("/items", validateData(itemSchema), ctl.createItem);

export default router;
