import { Router } from "express";
import ctl from "../controllers";
import { validateData } from "../middlewares";
import { userRegistrationSchema, userLoginSchema } from "../schemas";

const router = Router();

router.post(
  "/register",
  validateData(userRegistrationSchema),
  ctl.registerUser
);

router.post("/login", validateData(userLoginSchema), ctl.loginUser);

export default router;
