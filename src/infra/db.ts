import mysql, { PoolOptions } from "mysql2/promise";

const access: PoolOptions = {
  user: "root",
  password: "secret",
  database: "mydb",
};

export const conn = mysql.createPool(access);
