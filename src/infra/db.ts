import mysql, { PoolOptions } from "mysql2/promise";

const options: PoolOptions = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT!, 10),
};

export default mysql.createPool(options);
