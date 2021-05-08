const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = express.Router();

router.get("/mytasks/", auth, async (req, res) => {
  const match = {};
  const options = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sort) {
    const params = req.query.sort.split("_");
    sort[params[0]] = params[1] === "desc" ? -1 : 1;
  }
  if (req.query.limit) {
    options.limit = parseInt(req.query.limit);
    console.log(options.limit);
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          ...options,
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    res.status(500);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const allowedUpdateCommands = ["completed", "description"];
  const inputParams = Object.keys(req.body);
  const isValidCommand = inputParams.every((param) => {
    return allowedUpdateCommands.includes(param);
  });

  if (!isValidCommand) {
    return res.send(403).send("Fields not valid");
  }

  try {
    const task = await Task.findOne({
      id: req.params._id,
      owner: req.user._id,
    });
    inputParams.forEach((param) => (task[param] = req.body[param]));
    await task.save();

    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.find({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      res.status(404).send("Task not found");
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
