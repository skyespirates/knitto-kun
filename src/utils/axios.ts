import axios, { CreateAxiosDefaults } from "axios";

if (!process.env.ACCESS_TOKEN) {
  throw new Error("Missing environment variable: ACCESS_TOKEN");
}

const options: CreateAxiosDefaults = {
  baseURL: "https://api.themoviedb.org/3",
  timeout: 1000,
  headers: {
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
  },
};

export default axios.create(options);
