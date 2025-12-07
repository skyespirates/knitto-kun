import mysql, { PoolOptions } from "mysql2/promise";

const options: PoolOptions = {
  user: "root",
  password: "secret",
  database: "mydb",
};

export default mysql.createPool(options);
