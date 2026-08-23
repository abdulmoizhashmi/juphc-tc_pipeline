/* public/app.js – Tax Calculator frontend */

const form         = document.getElementById("tax-form");
const incomeInput  = document.getElementById("income");
const calcBtn      = document.getElementById("calc-btn");
const message      = document.getElementById("message");
const result       = document.getElementById("result");
const incomeResult = document.getElementById("income-result");
const taxResult    = document.getElementById("tax-result");
const afterTaxResult = document.getElementById("after-tax-result");
const rateBadge    = document.getElementById("rate-badge");
const bracketList  = document.getElementById("bracket-list");

/* ─── Helpers ─────────────────────────────────────────────── */

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const pct = (value) =>
  new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

function setMessage(text) {
  message.textContent = text;
}

function clearMessage() {
  message.textContent = "";
}

/* ─── Form Submit ─────────────────────────────────────────── */

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const rawValue = incomeInput.value.trim();
  if (rawValue === "" || Number(rawValue) < 0) {
    setMessage("Please enter a valid non-negative income amount.");
    return;
  }

  calcBtn.disabled = true;
  calcBtn.textContent = "Calculating…";

  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ income: rawValue }),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Calculation failed.");

    // Populate result rows
    incomeResult.textContent   = money(data.income);
    taxResult.textContent      = money(data.tax);
    afterTaxResult.textContent = money(data.afterTaxIncome);

    // Effective rate badge
    const effectiveRate = data.income > 0 ? data.tax / data.income : 0;
    rateBadge.textContent = `⚡ Effective rate: ${pct(effectiveRate)}`;

    // Show panel (re-triggers animation by removing+re-adding)
    result.classList.remove("hidden");
    void result.offsetHeight; // force reflow for animation replay
  } catch (error) {
    setMessage(error.message);
  } finally {
    calcBtn.disabled = false;
    calcBtn.textContent = "Calculate";
  }
});

/* ─── Load Tax Brackets from API ─────────────────────────── */

async function loadBrackets() {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) throw new Error("Configuration unavailable.");

    const data = await response.json();

    bracketList.innerHTML = data.brackets
      .map((b, i) => {
        const upper =
          b.max === null
            ? "and above"
            : `– ${money(b.max)}`;
        const rate = Number(b.rate);
        const rateClass = rate === 0 ? "bracket-rate zero" : "bracket-rate";
        const rateLabel = rate === 0 ? "Tax-free" : pct(rate);
        // stagger animation delay per bracket
        return `<div class="bracket" style="animation-delay:${i * 60}ms" role="row">
          <span class="bracket-range">${money(b.min)} ${upper}</span>
          <span class="${rateClass}">${rateLabel}</span>
        </div>`;
      })
      .join("");
  } catch (error) {
    bracketList.innerHTML = `<p style="color:var(--text-secondary);font-size:.88rem;">${error.message}</p>`;
  }
}

loadBrackets();