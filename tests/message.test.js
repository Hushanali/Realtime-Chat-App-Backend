const request = require("supertest");
const mongoose = require("mongoose");
const path = require("path");
const { app, server } = require("../index");

let token;

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

describe("Message Routes", () => {
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

  it("should upload file and save message", async () => {
    const res = await request(app)
      .post("/messages/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("sender", "687210e87e7a6eb92d0719e4")
      .field("receiver", "6874ac0e3b228cdf6fbc09f9")
      .attach("file", path.join(__dirname, "../uploads/1752152587574.png"));

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("mediaUrl");
    expect(res.body.data).toHaveProperty("mediaType");
  });

  it("should return 400 if sender or receiver missing", async () => {
    const res = await request(app)
      .post("/messages/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("sender", "")
      .field("receiver", "6874ac0e3b228cdf6fbc09f9");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Sender and Receiver are required"
    );
  });

  it("should return 400 if no file is uploaded", async () => {
    const res = await request(app)
      .post("/messages/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("sender", "687210e87e7a6eb92d0719e4")
      .field("receiver", "6874ac0e3b228cdf6fbc09f9");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "No file uploaded");
  });

  it("should fetch messages between sender and receiver", async () => {
    const res = await request(app)
      .get("/messages")
      .query({
        sender: "687210e87e7a6eb92d0719e4",
        receiver: "6874ac0e3b228cdf6fbc09f9",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
