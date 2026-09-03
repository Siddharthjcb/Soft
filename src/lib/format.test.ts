import { describe, it, expect } from "vitest";
import { formatINR } from "@/lib/format";

describe("formatINR", () => {
  it("renders whole rupees without decimals", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR(49900)).toBe("₹499");
    expect(formatINR(499900)).toBe("₹4,999");
    expect(formatINR(3999900)).toBe("₹39,999");
  });

  it("uses Indian digit grouping, not thousands", () => {
    expect(formatINR(10000000)).toBe("₹1,00,000");
  });

  it("shows paise only when the amount is not a whole rupee", () => {
    expect(formatINR(123456789)).toBe("₹12,34,567.89");
    expect(formatINR(150)).toBe("₹1.5");
  });
});
