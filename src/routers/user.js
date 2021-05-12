const express = require("express");
const User = require("../models/user");
const userRouter = new express.Router();
const auth = require("../middleware/auth");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail } = require('../emails/account')

userRouter.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    await sendWelcomeEmail(user.email, user.name)
    //res.cookie('auth_token', token)
    //res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'))
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send(error);
  }
});

userRouter.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

userRouter.patch("/users/me", auth, async (req, res) => {
  const keys = Object.keys(req.body);
  const allowedProps = ["name", "age", "email", "password"];
  const isValidOps = keys.every((key) => {
    return allowedProps.includes(key);
  });

  if (!isValidOps) {
    return res.status(403).send("Not allowed to update");
  }

  try {
    const user = await User.findById(req.user._id);

    keys.forEach((key) => (user[key] = req.body[key]));

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(400).send();
    console.log(e);
  }
});

userRouter.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    //res.cookie('auth_token', token)
    //res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'))
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

userRouter.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
});

userRouter.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
    console.log(e);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg)$/)) {
      return cb(new Error("Please upload jpeg or jpg"));
    }

    cb(undefined, true);
  },
});

userRouter.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height:250 }).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

userRouter.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

userRouter.get("/users/:id/avatar", async (req, res) => {
  const user = await User.findById(req.params.id);
  try {
    if (!user || !user.avatar) {
      console.log(user.avatar)
      return res.status(404).send()
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

module.exports = userRouter;
