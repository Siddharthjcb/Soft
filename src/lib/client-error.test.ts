import { describe, it, expect } from "vitest";
import { apiErrorMessage } from "@/lib/client-error";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiErrorMessage", () => {
  it("reads the { error: { code, message } } envelope", async () => {
    const res = jsonResponse({
      error: { code: "rate_limited", message: "Too many requests." },
    });
    expect(await apiErrorMessage(res, "fallback")).toBe("Too many requests.");
  });

  it("still handles a legacy string error", async () => {
    const res = jsonResponse({ error: "Old shape" });
    expect(await apiErrorMessage(res, "fallback")).toBe("Old shape");
  });

  it("falls back when the body is not JSON", async () => {
    const res = new Response("<html>502</html>", { status: 502 });
    expect(await apiErrorMessage(res, "fallback")).toBe("fallback");
  });

  it("falls back on an empty or unexpected body", async () => {
    expect(await apiErrorMessage(jsonResponse({}), "fallback")).toBe("fallback");
    expect(await apiErrorMessage(jsonResponse(null), "fallback")).toBe("fallback");
    expect(await apiErrorMessage(jsonResponse({ error: {} }), "fallback")).toBe(
      "fallback",
    );
  });
});
