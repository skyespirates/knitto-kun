import { Router } from "express";
import basicRoutes from "./basic.route";
import otpRoutes from "./otp.route";
import userController from "../../controllers/user.controller";
import { validateData } from "../../middlewares";
import { userRegistrationSchema } from "../../schemas";

const router = Router();

router.post(
  "/register",
  validateData(userRegistrationSchema),
  userController.register
);
router.use("/basic", basicRoutes);
router.use("/otp", otpRoutes);

export default router;
