const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

const configPath = path.join(__dirname, "config", "tax-brackets.json");

function loadTaxBrackets() {
  const raw = fs.readFileSync(configPath, "utf8");
  const brackets = JSON.parse(raw);

  if (!Array.isArray(brackets) || brackets.length === 0) {
    throw new Error("Tax bracket configuration is empty or invalid.");
  }

  return brackets;
}

/**
 * Calculates progressive tax from configuration.
 * Each bracket contains:
 *   min: lower income bound
 *   max: upper income bound, or null for the final bracket
 *   rate: tax rate as a decimal
 */
function calculateTax(income, brackets = loadTaxBrackets()) {
  const numericIncome = Number(income);

  if (!Number.isFinite(numericIncome) || numericIncome < 0) {
    throw new Error("Income must be a non-negative number.");
  }

  let tax = 0;

  for (const bracket of brackets) {
    const min = Number(bracket.min);
    const max = bracket.max === null ? Infinity : Number(bracket.max);
    const rate = Number(bracket.rate);

    if (!Number.isFinite(min) || !Number.isFinite(rate) || rate < 0) {
      throw new Error("Invalid tax bracket configuration.");
    }

    if (numericIncome > min) {
      const taxableAmount = Math.min(numericIncome, max) - min;
      if (taxableAmount > 0) {
        tax += taxableAmount * rate;
      }
    }
  }

  return Number(tax.toFixed(2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "tax-calculator" });
});

app.get("/api/config", (req, res) => {
  try {
    res.json({ brackets: loadTaxBrackets() });
  } catch (error) {
    res.status(500).json({ error: "Unable to load tax configuration." });
  }
});

app.post("/api/calculate", (req, res) => {
  try {
    const { income } = req.body;
    const tax = calculateTax(income);
    const numericIncome = Number(income);

    res.json({
      income: numericIncome,
      tax,
      afterTaxIncome: Number((numericIncome - tax).toFixed(2))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tax Calculator running on port ${PORT}`);
  });
}

module.exports = { app, calculateTax, loadTaxBrackets };