import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import logger from "./utils/logger";
import authRoutes from "./routes/auth";
import runnerRoutes from "./routes/runner.route";
import movieRoutes from "./routes/movie.route";
import requestRoutes from "./routes/request.route";
import protectedRoutes from "./routes/protected.route";
import cron from "node-cron";
import { storeLogRequest, authenticateJWT, logging } from "./middlewares";
import otpService from "./services/otp.service";
import { JwtPayload } from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 8080;

app.use(logging);
app.use(express.json());
app.use(storeLogRequest);

// #1 autentikasi dengan 2 metode login, basic dan otp
app.use("/auth", authRoutes);

// #2 running number
app.use("/runner", runnerRoutes);

// #3 integrasi dengan API eksternal
app.use("/movies", movieRoutes);

// #7 data laporan jumlah request user per jam
app.use("/rph", requestRoutes);

app.use("/protected", authenticateJWT, protectedRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

/*
  #5 scheduling task
  Hapus semua kode otp yg expired setiap senin jam 1 malam
*/
cron.schedule("* 1 * * 1", async () => {
  await otpService.cleanupExpiredAndUsedOTP();
});

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}
