import { Router } from "express";
import ctl from "../controllers/account.controller";
import { validateData } from "../middlewares";
import { newAccountSchema } from "../schemas";

const router = Router();

router.post("/", validateData(newAccountSchema), ctl.createAccount);

export default router;
