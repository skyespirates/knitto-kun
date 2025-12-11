import "dotenv/config";
import express, { Request, Response } from "express";
import logger from "./utils/logger";
import cron from "node-cron";
import { storeLogRequest, authenticateJWT, logging } from "./middlewares";
import { JwtPayload } from "jsonwebtoken";
import otpService from "./services/otp.service";
import fs from "fs/promises";
import getCurrentDate from "./utils/date";
import pool from "./infra/db";
import { sendErrorResponse } from "./utils/base-response";

// routes
import authRoutes from "./routes/auth";
import runnerRoutes from "./routes/runner.route";
import movieRoutes from "./routes/movie.route";
import requestRoutes from "./routes/request.route";
import protectedRoutes from "./routes/protected.route";
import accountRoutes from "./routes/account.route";
import transferRoutes from "./routes/transfer.route";
import runnerService from "./services/runner.service";

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

// #6 endpoint dengan lebih dari 2 query
app.use("/transfer", transferRoutes);

app.use("/account", accountRoutes);

// #7 data laporan jumlah request user per jam
app.use("/rph", requestRoutes);

app.use("/protected", authenticateJWT, protectedRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

const filePath = "database/customer-order";

app.post("/order", async (req, res) => {
  const conn = await pool.getConnection();
  const customer_id = 1;
  try {
    const orderPayload = {
      address: "dafsa",
      payment_type: "dsafdas",
      items: [
        {
          id_product: 1,
          name: "sdfdas",
          price: 5000,
          qty: 2,
        },
      ],
    };
    const order = {
      no_order: "hehe",
      id_customer: 1,
      name: "dsfsda",
      email: "dsfads",
      total: 4000,
      status: "order diterima",
      ...orderPayload,
    };

    await conn.beginTransaction();

    const counter = await runnerService.getCounter(conn, "invoice");
    if (counter == null) {
      sendErrorResponse(res, "counter not found");
      return;
    }

    const lastNumber = counter.current;
    const nextNumber = lastNumber + 1;

    await runnerService.increaseCounter(conn, nextNumber, "invoice");

    const code = nextNumber.toString().padStart(5, "0");

    const json = JSON.stringify(order);

    await fs.mkdir(filePath, { recursive: true });

    const fileName = `ORDER-${customer_id}-${getCurrentDate()}-${code}`;

    await fs.writeFile(`${filePath}/${fileName}.json`, json);

    const data = {
      message: "order berhasil diproses",
      result: {
        order_number: fileName,
      },
    };
    res.json(data);
  } catch (error) {
    await conn.rollback();
    logger.error(error);
    throw new Error("failed to order");
  } finally {
    conn.release();
  }
});

// Runs every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  const files = await fs.readdir(filePath);

  for (const file of files) {
    const file_path = `${filePath}/${file}`;
    const content = await fs.readFile(file_path, "utf8");
    const order = JSON.parse(content);
    order.status = "Dikirim ke customer";

    const updatedOrder = JSON.stringify(order);

    const path = `${filePath}/${file}`;

    await fs.writeFile(path, updatedOrder);

    const p = "database/delivered-order";
    await fs.mkdir(p, { recursive: true });

    await fs.copyFile(path, `${p}/${file}`);
  }
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
