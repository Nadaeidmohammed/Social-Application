import express from "express"
import { bootstrab } from "./src/app.controller.js";
import dotenv from "dotenv";
import chalk from "chalk";
const app = express()

dotenv.config({path:"./src/config/.env"});
const port = process.env.PORT||5000;

await bootstrab(app,express)
app.listen(port, () => console.log(chalk.bgRed.bold(`Example app listening on port ${port}!`)))