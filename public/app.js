const form = document.getElementById("tax-form");
const incomeInput = document.getElementById("income");
const message = document.getElementById("message");
const result = document.getElementById("result");
const incomeResult = document.getElementById("income-result");
const taxResult = document.getElementById("tax-result");
const afterTaxResult = document.getElementById("after-tax-result");
const bracketList = document.getElementById("bracket-list");

const money = value =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  result.classList.add("hidden");

  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ income: incomeInput.value })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Calculation failed.");

    incomeResult.textContent = money(data.income);
    taxResult.textContent = money(data.tax);
    afterTaxResult.textContent = money(data.afterTaxIncome);
    result.classList.remove("hidden");
  } catch (error) {
    message.textContent = error.message;
  }
});

async function loadBrackets() {
  try {
    const response = await fetch("/api/config");
    const data = await response.json();

    if (!response.ok) throw new Error("Configuration unavailable.");

    bracketList.innerHTML = data.brackets.map((b) => {
      const upper = b.max === null ? "and above" : `- $${Number(b.max).toLocaleString()}`;
      return `<div class="bracket">
        <span>$${Number(b.min).toLocaleString()} ${upper}</span>
        <strong>${Number(b.rate) * 100}%</strong>
      </div>`;
    }).join("");
  } catch (error) {
    bracketList.textContent = error.message;
  }
}

loadBrackets();