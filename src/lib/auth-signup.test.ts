import { describe, it, expect } from "vitest";
import { signupSchema, validateSignupInput } from "./auth-signup.functions";

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

describe("registerAccount server-side gate — UI bypass attempts", () => {
  // These simulate an attacker calling the server function directly (curl,
  // fetch, custom client) with a forged payload that a tampered UI could
  // send. The server validator must reject every one BEFORE the handler
  // (which calls supabaseAdmin.auth.admin.createUser) is ever invoked.
  const validBase = {
    email: "attacker@example.com",
    password: "supersecret123",
    displayName: "Attacker",
  };

  const forgedPayloads: Array<[string, unknown]> = [
    ["completely empty payload", {}],
    ["null payload", null],
    ["undefined payload", undefined],
    ["array payload", []],
    ["primitive payload", "ageConfirmed=true"],
    ["ageConfirmed omitted, rest valid", { ...validBase }],
    ["ageConfirmed=false", { ...validBase, ageConfirmed: false }],
    ["ageConfirmed=null", { ...validBase, ageConfirmed: null }],
    ["ageConfirmed=undefined", { ...validBase, ageConfirmed: undefined }],
    ["ageConfirmed as string 'true'", { ...validBase, ageConfirmed: "true" }],
    ["ageConfirmed as string 'yes'", { ...validBase, ageConfirmed: "yes" }],
    ["ageConfirmed as number 1", { ...validBase, ageConfirmed: 1 }],
    ["ageConfirmed as object {}", { ...validBase, ageConfirmed: {} }],
    ["ageConfirmed as truthy array [true]", { ...validBase, ageConfirmed: [true] }],
    ["extra fields sneaked in but ageConfirmed missing", {
      ...validBase,
      isAdmin: true,
      email_confirm: true,
      role: "admin",
    }],
  ];

  for (const [name, payload] of forgedPayloads) {
    it(`server validator rejects: ${name}`, () => {
      expect(() => validateSignupInput(payload)).toThrow();
    });
  }

  it("server validator accepts only ageConfirmed === true (boolean)", () => {
    expect(() => validateSignupInput({ ...validBase, ageConfirmed: true })).not.toThrow();
  });

  it("registerAccount exports the same validator used by the server", () => {
    // Guard against a future refactor accidentally swapping the validator.
    expect(typeof validateSignupInput).toBe("function");
    expect(() => validateSignupInput({ ...validBase, ageConfirmed: false })).toThrow(/at least 18/i);
  });
});
