import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";

import rootRoutes from "./routes/root";
import { json } from "stream/consumers";

import connectLiveReload from "connect-livereload";
//import livereload from "livereload";

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import authRoutes from './routes/authRoutes';


import * as configuration from "./config";
import * as routes from "./routes";

configuration.configureLiveReload(app, staticPath);


const app = express();
const PORT = process.env.PORT || 3000;

const staticPath = path.join(process.cwd(), "src", "public");

const pool = new Pool({
  user: 'yourUsername',
  host: 'localhost',
  database: 'yourDatabase',
  password: 'yourPassword',
  port: 5432,
});

app.use("/api/auth", authRoutes);

app.use(express.static(staticPath));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "src", "public")));

app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

app.use("/", rootRoutes);
app.use((_request, _response, next) => {
  next(httpErrors(404));
});

app.use(express.static(staticPath));

if (process.env.NODE_ENV === "development") {
  const reloadServer = livereload.createServer();

  reloadServer.watch(staticPath);
  reloadServer.server.once("connection", () => {
    setTimeout(() => {
      reloadServer.refresh("/");
    }, 100);
  });
  app.use(connectLiveReload());
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
