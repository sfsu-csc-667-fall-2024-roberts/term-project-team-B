import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";

import rootRoutes from "./routes/root";
import authRoutes from "./routes/auth";
import { json } from "stream/consumers";

import connectLiveReload from "connect-livereload";
import livereload from "livereload";

const app = express();
const PORT = process.env.PORT || 3000;

const staticPath = path.join(process.cwd(), "src", "public");

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), "src", "public")));

app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

app.use("/", rootRoutes);
app.use("/auth", authRoutes);

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
