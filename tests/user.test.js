const request = require("supertest");
const mongoose = require("mongoose");
const { app, server } = require("../index");

let token;
let currentUser = "Adonis";

beforeAll(async () => {
  const res = await request(app).post("/auth/login").send({
    email: "adonis@gmail.com",
    password: "Adonis@123",
  });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  server.close();
});

describe("User routes", () => {
  it("should return 401 if no Authorization header is provided", async () => {
    const res = await request(app).get("/users");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty(
      "message",
      "Access denied: No token provided"
    );
  });

  it("should return 401 if Authorization header is malformed", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", "Token abc123");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty(
      "message",
      "Access denied: No token provided"
    );
  });

  it("should fetch all user except current user", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`)
      .query({ currentUser });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const usernames = res.body.map((user) => user.username);
    expect(usernames).not.toContain(currentUser);
  });
});
