const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(userRouter);
app.use(taskRouter);
app.use(cookieParser());

module.exports = app