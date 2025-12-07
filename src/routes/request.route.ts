import { Router } from "express";
import ctl from "../controllers/request.controller";
const router = Router();

router.get("/", ctl.getRequestPerHour);

export default router;
