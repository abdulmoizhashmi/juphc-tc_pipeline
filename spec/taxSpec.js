const { calculateTax } = require("../app");

describe("Tax Calculator", () => {
  const brackets = [
    { min: 0, max: 10000, rate: 0 },
    { min: 10000, max: 30000, rate: 0.10 },
    { min: 30000, max: 60000, rate: 0.20 },
    { min: 60000, max: null, rate: 0.30 }
  ];

  it("returns zero tax for income in the tax-free bracket", () => {
    expect(calculateTax(5000, brackets)).toBe(0);
  });

  it("calculates tax progressively for middle income", () => {
    expect(calculateTax(20000, brackets)).toBe(1000);
  });

  it("calculates tax across three brackets", () => {
    expect(calculateTax(50000, brackets)).toBe(6000);
  });

  it("calculates tax across all brackets", () => {
    expect(calculateTax(100000, brackets)).toBe(20000);
  });

  it("rejects negative income", () => {
    expect(() => calculateTax(-1, brackets)).toThrowError();
  });

  it("rejects non-numeric income", () => {
    expect(() => calculateTax("abc", brackets)).toThrowError();
  });
  it("calculates zero tax for zero income", () => {
    expect(calculateTax(0, brackets)).toBe(0);
  });
});