const request = require("supertest");
const mongoose = require("mongoose");
const { app, server } = require("../index");

afterAll(async () => {
  await mongoose.disconnect();
  server.close();
});

describe("Auth API routes", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "Apollo",
      email: "apollo@gmail.com",
      password: "apollo@123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("username");
    expect(res.body).toHaveProperty("email");
  });

  it("should return 400 if email already exists", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "Rocky",
      email: "rocky@gmail.com",
      password: "Rocky@123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Email already exist. Please login."
    );
  });

  it("should return 400 if username already exists", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "Rocky",
      email: "rock@gmail.com",
      password: "Rocky@123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Username already exist.");
  });

  it("should login the user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "adonis@gmail.com",
      password: "Adonis@123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("username");
  });

  it("should return 400 if user does not exist", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "xyz@gmail.com",
      password: "Apollo@123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "User does not exist. Please registered."
    );
  });

  it("should return 400 if password not match", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "adonis@gmail.com",
      password: "Aonis@123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });
});
