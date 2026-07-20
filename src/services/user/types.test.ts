import { describe, expect, it } from "vitest";
import { schemaCreateUserRequest, schemaUpdateUserRequest } from "./types";

const validCreate = {
  fullName: "Andi Pratama",
  email: "andi@student.ac.id",
  password: "password123",
};

describe("schemaCreateUserRequest", () => {
  it("accepts a valid payload", () => {
    expect(schemaCreateUserRequest.safeParse(validCreate).success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = schemaCreateUserRequest.safeParse({ ...validCreate, password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = schemaCreateUserRequest.safeParse({ ...validCreate, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty fullName", () => {
    const result = schemaCreateUserRequest.safeParse({ ...validCreate, fullName: "" });
    expect(result.success).toBe(false);
  });
});

describe("schemaUpdateUserRequest", () => {
  it("allows an empty password (keep the existing one)", () => {
    const result = schemaUpdateUserRequest.safeParse({
      fullName: "Andi Pratama",
      email: "andi@student.ac.id",
      password: "",
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a too-short password when one is provided", () => {
    const result = schemaUpdateUserRequest.safeParse({
      fullName: "Andi Pratama",
      email: "andi@student.ac.id",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
