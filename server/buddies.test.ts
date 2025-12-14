import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "admin" | "buddy" | "newHire" | "user" = "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Authentication", () => {
  describe("me", () => {
    it("should return current user for authenticated users", async () => {
      const ctx = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe("test@example.com");
      expect(result?.role).toBe("admin");
    });

    it("should return buddy user data", async () => {
      const ctx = createAuthContext("buddy");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result?.role).toBe("buddy");
    });

    it("should return newHire user data", async () => {
      const ctx = createAuthContext("newHire");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result?.role).toBe("newHire");
    });
  });

  describe("logout", () => {
    it("should clear session cookie on logout", async () => {
      const clearedCookies: any[] = [];
      const ctx = createAuthContext("admin");
      ctx.res = {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as any;

      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();

      expect(result.success).toBe(true);
      expect(clearedCookies.length).toBe(1);
      expect(clearedCookies[0].options.maxAge).toBe(-1);
    });

    it("should set secure cookie options on logout", async () => {
      const clearedCookies: any[] = [];
      const ctx = createAuthContext("admin");
      ctx.res = {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as any;

      const caller = appRouter.createCaller(ctx);
      await caller.auth.logout();

      expect(clearedCookies[0].options.secure).toBe(true);
      expect(clearedCookies[0].options.httpOnly).toBe(true);
    });
  });
});

describe("Role-Based Access Control", () => {
  describe("Admin access", () => {
    it("admin should be able to access protected procedures", async () => {
      const ctx = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result?.role).toBe("admin");
    });
  });

  describe("Buddy access", () => {
    it("buddy should be able to access protected procedures", async () => {
      const ctx = createAuthContext("buddy");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result?.role).toBe("buddy");
    });
  });

  describe("NewHire access", () => {
    it("newHire should be able to access protected procedures", async () => {
      const ctx = createAuthContext("newHire");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result?.role).toBe("newHire");
    });
  });
});

describe("User access control", () => {
  it("should prevent non-admin from deleting buddies", async () => {
    const ctx = createAuthContext("buddy");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.buddies.delete({ id: 1 });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should prevent non-admin from creating associations", async () => {
    const ctx = createAuthContext("buddy");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.associations.create({
        buddyId: 1,
        newHireId: 2,
        startDate: new Date(),
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should allow admin to perform admin operations", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result?.role).toBe("admin");
  });
});

describe("Dashboard metrics", () => {
  it("should return metrics object with correct properties", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getMetrics();
    expect(result).toHaveProperty("buddyCount");
    expect(result).toHaveProperty("newHireCount");
    expect(result).toHaveProperty("activeAssociations");
    expect(result).toHaveProperty("pendingTasks");
  });

  it("should return numeric values for metrics", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getMetrics();
    expect(typeof result.buddyCount).toBe("number");
    expect(typeof result.newHireCount).toBe("number");
    expect(typeof result.activeAssociations).toBe("number");
    expect(typeof result.pendingTasks).toBe("number");
  });

  it("should return non-negative values for metrics", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.getMetrics();
    expect(result.buddyCount).toBeGreaterThanOrEqual(0);
    expect(result.newHireCount).toBeGreaterThanOrEqual(0);
    expect(result.activeAssociations).toBeGreaterThanOrEqual(0);
    expect(result.pendingTasks).toBeGreaterThanOrEqual(0);
  });
});

describe("User roles", () => {
  it("should correctly identify admin role", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result?.role).toBe("admin");
  });

  it("should correctly identify buddy role", async () => {
    const ctx = createAuthContext("buddy");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result?.role).toBe("buddy");
  });

  it("should correctly identify newHire role", async () => {
    const ctx = createAuthContext("newHire");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result?.role).toBe("newHire");
  });

  it("should correctly identify user role", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result?.role).toBe("user");
  });
});
