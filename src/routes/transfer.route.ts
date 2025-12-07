import { Router } from "express";
import ctl from "../controllers/transfer.controller";
import { validateData } from "../middlewares";
import { transferSchema } from "../schemas";

const router = Router();

router.post("/", validateData(transferSchema), ctl.transfer);

export default router;
