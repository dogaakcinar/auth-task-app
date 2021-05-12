const req = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");
const User = require("../src/models/user");
const mongoose = require("mongoose");

var id = mongoose.Types.ObjectId();
const token = jwt.sign({ _id: id }, process.env.JWT_SECRET);
const randomUser = {
  _id: id,
  name: "Deno",
  email: "deno@gmail.com",
  password: "123456",
  tokens: [
    {
      token: token,
    },
  ],
};

const nonExistingUser = {
  name: "noexist",
  email: "xxx@gmail.com",
  password: "1",
};
beforeEach(async () => {
  await User.deleteMany();
  await new User(randomUser).save();
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});

test("Should signup a new user", async () => {
  const response = await req(app)
    .post("/users")
    .send({
      name: "Andrew",
      email: "dogas1@example.com",
      password: "Mypass11",
    })
    .expect(201);

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull(
    expect(user.password).not.toBe('Mypass11')
    )
});

test("Should log in existing user", async () => {
  await req(app)
    .post("/login")
    .send({
      email: randomUser.email,
      password: randomUser.password,
    })
    .expect(200);
});

test("Should not log with non existing user", async () => {
  await req(app)
    .post("/login")
    .send({
      email: nonExistingUser.email,
      password: nonExistingUser.password,
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await req(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${randomUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should delete account for user", async () => {
  await req(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${randomUser.tokens[0].token}`)
    .send()
    .expect(200);
});
