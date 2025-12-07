import { Router } from "express";
import ctl from "../../controllers/auth/otp.controller";

const router = Router();

router.post("/request", ctl.request);
router.post("/verify", ctl.verify);

export default router;
