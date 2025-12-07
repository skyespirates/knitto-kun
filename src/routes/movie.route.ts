import { Router } from "express";
import ctl from "../controllers/movie.controller";
const router = Router();

router.get("/", ctl.getMovies);

export default router;
