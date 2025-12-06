import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import logger from "./utils/logger";
import jwt from "jsonwebtoken";
import authRoutes from "./routes";
import { sendErrorResponse, sendSuccessResponse } from "./utils/base-response";
import { conn } from "./infra/db";
import { Counter, OTP, RequestPerHour, User } from "./types";
import client from "./utils/axios";
import cron from "node-cron";
import { logRequest } from "./middlewares";

const app = express();
const port = 3000;

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  res.on("finish", () => {
    logger.info(`${req.method} ${res.statusCode} ${req.url}`);
  });
  next();
});
app.use(express.json());
app.use(logRequest);

app.use("/auth", authRoutes);

if (!process.env.JWT_SECRET) {
  throw new Error("Missing environment variable: JWT_SECRET");
}

const secretKey = process.env.JWT_SECRET;

// Middleware to verify JWT
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (token) {
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Login route to generate JWT
app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  // This is a mock user authentication
  if (username === "user" && password === "password") {
    const user = { username };
    const token = jwt.sign(user, secretKey, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

app.get("/", (req: Request, res: Response) => {
  const data = {
    message: "Hello, world!",
  };
  res.json(data);
});

// Protect the /api/items route with JWT authentication
app.get("/api/items", authenticateJWT, (req: Request, res: Response) => {
  const data = [
    { id: 1, name: "item1" },
    { id: 2, name: "item2" },
    { id: 3, name: "item3" },
  ];
  res.json(data);
});

// Protect the /api/items POST route with JWT authentication
app.post("/api/items", authenticateJWT, (req: Request, res: Response) => {
  const newItem = req.body.item;
  res.status(201).json({ message: "Item created", item: newItem });
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/otp/generate", async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await conn.execute<User[]>(
      "SELECT * FROM users where email = ?",
      [email]
    );
    if (rows.length == 0) {
      sendErrorResponse(res, "email not found");
      return;
    }

    const user_id = rows[0].id;
    const kode_otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await conn.execute(
      "INSERT INTO otp_codes (user_id, otp_code, expires_at) VALUES (?, ?, ?)",
      [user_id, kode_otp, expiresAt]
    );

    sendSuccessResponse(res, "OTP sent", { otp: kode_otp });
  } catch (error) {
    sendErrorResponse(res, "failed to generate otp");
  }
});

app.post("/otp/verify", async (req, res) => {
  const { email, otp_code } = req.body;

  try {
    const [users] = await conn.execute<User[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (users.length == 0) {
      sendErrorResponse(res, "email not found");
      return;
    }
    const [otp] = await conn.execute<OTP[]>(
      "SELECT * FROM otp_codes WHERE user_id = ? AND otp_code = ? and expires_at < NOW() and used = 0 ORDER BY id LIMIT 1",
      [users[0].id, otp_code]
    );
    if (otp.length == 0) {
      sendErrorResponse(res, "wrong otp");
      return;
    }

    await conn.execute("UPDATE otp_codes SET used = 1 WHERE id = ?", [
      otp[0].id,
    ]);

    sendSuccessResponse(res, "otp verified successfully");
  } catch (error) {
    sendErrorResponse(res, "failed to verify otp");
  }
});

app.get("/runner", async (req, res) => {
  const con = await conn.getConnection();
  try {
    await con.beginTransaction();

    const [counters] = await con.execute<Counter[]>(
      "SELECT current FROM counters WHERE name = ? FOR UPDATE",
      ["invoice"]
    );

    const lastNumber = counters[0].current;
    const nextNumber = lastNumber + 1;

    await con.execute("UPDATE counters SET current = ? WHERE name = ?", [
      nextNumber,
      "invoice",
    ]);

    const code = nextNumber.toString().padStart(4, "0");
    const uniqueCode = `INV-${code}`;

    await con.execute("INSERT INTO runner (code) VALUES (?)", [uniqueCode]);

    await con.commit();
    sendSuccessResponse(res, "code generated successfully", {
      code: uniqueCode,
    });
  } catch (error) {
    sendErrorResponse(res, "failed to generate runner");
  } finally {
    con.release();
  }
});

app.get("/movies", async (req, res) => {
  try {
    const result = await client.get("/discover/movie", {
      params: {
        include_adult: false,
        include_video: false,
        language: "en-US",
        page: 2,
        sort_by: "popularity.desc",
      },
    });
    sendSuccessResponse(res, "success", {
      ...result.data,
    });
  } catch (error) {
    logger.error(error);
    sendErrorResponse(res, "error");
  }
});

app.get("/request-per-hour", async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour,
        COUNT(*) AS total_requests
      FROM request_logs
      GROUP BY hour
      ORDER BY hour DESC
    `;
    const [rows] = await conn.execute<RequestPerHour[]>(query);
    sendSuccessResponse(res, "request per hour", { rows });
  } catch (error) {
    sendErrorResponse(res, "an error occured");
  }
});

cron.schedule("* * * * *", () => {
  logger.info("hello, world!");
});

// Middleware to log errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
