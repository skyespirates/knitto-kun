import { Router } from "express";
import ctl from "../../controllers/auth/basic.controller";
import { validateData } from "../../middlewares";
import { userLoginSchema } from "../../schemas";

const router = Router();

router.post("/login", validateData(userLoginSchema), ctl.login);

export default router;
