import { Router } from "express";
import ctl from "../controllers/runner.controller";
const router = Router();

router.post("/", ctl.generateRunnerCode);

export default router;
