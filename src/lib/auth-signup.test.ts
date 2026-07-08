import { describe, it, expect } from "vitest";
import { signupSchema } from "./auth-signup.functions";

const base = {
  email: "user@example.com",
  password: "supersecret123",
  displayName: "Test User",
};

describe("registerAccount input validation (age gate)", () => {
  it("accepts a valid payload with ageConfirmed=true", () => {
    const result = signupSchema.safeParse({ ...base, ageConfirmed: true });
    expect(result.success).toBe(true);
  });

  it("rejects when ageConfirmed is missing", () => {
    const result = signupSchema.safeParse(base);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "ageConfirmed")).toBe(true);
    }
  });

  it("rejects when ageConfirmed is false", () => {
    const result = signupSchema.safeParse({ ...base, ageConfirmed: false });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "ageConfirmed");
      expect(issue?.message).toMatch(/at least 18/i);
    }
  });

  it("rejects when ageConfirmed is a truthy non-boolean (e.g. string 'true')", () => {
    const result = signupSchema.safeParse({ ...base, ageConfirmed: "true" });
    expect(result.success).toBe(false);
  });

  it("rejects when ageConfirmed is 1 (number coerced truthy)", () => {
    const result = signupSchema.safeParse({ ...base, ageConfirmed: 1 });
    expect(result.success).toBe(false);
  });

  it("still rejects when only ageConfirmed is invalid but other fields are valid", () => {
    const result = signupSchema.safeParse({
      email: "another@example.com",
      password: "anotherstrongpass",
      displayName: "Another",
      ageConfirmed: false,
    });
    expect(result.success).toBe(false);
  });
});
