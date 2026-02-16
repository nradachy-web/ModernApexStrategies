(() => {
  const body = document.body;
  const currentPage = body.dataset.page || "";

  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll(".site-nav a[data-page]").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) {
        return;
      }
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((entry) => {
        entry.classList.remove("open");
      });
      if (!wasOpen) {
        item.classList.add("open");
      }
    });
  });

  const form = document.getElementById("adsSimulator");
  if (!form) {
    return;
  }

  const controls = [
    { id: "budget", output: "budgetValue", format: "money" },
    { id: "cpc", output: "cpcValue", format: "money" },
    { id: "conversionRate", output: "conversionRateValue", format: "percent" },
    { id: "closeRate", output: "closeRateValue", format: "percent" },
    { id: "averageSale", output: "averageSaleValue", format: "money" },
    { id: "monthGrowth", output: "monthGrowthValue", format: "percent" }
  ];

  const metrics = {
    clicks: document.getElementById("clicksValue"),
    leads: document.getElementById("leadsValue"),
    customers: document.getElementById("customersValue"),
    revenue: document.getElementById("revenueValue"),
    roas: document.getElementById("roasValue"),
    cac: document.getElementById("cacValue")
  };

  const growthBars = document.getElementById("growthBars");
  const growthSummary = document.getElementById("growthSummary");

  const getNumber = (id) => Number(document.getElementById(id).value);
  const formatMoney = (value) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
  const formatCount = (value) =>
    value.toLocaleString("en-US", {
      maximumFractionDigits: value < 10 ? 1 : 0
    });

  const updateControlLabels = () => {
    controls.forEach((control) => {
      const input = document.getElementById(control.id);
      const output = document.getElementById(control.output);
      if (!input || !output) {
        return;
      }
      const value = Number(input.value);
      if (control.format === "money") {
        output.textContent = formatMoney(value);
      } else if (control.format === "percent") {
        output.textContent = `${value}%`;
      } else {
        output.textContent = String(value);
      }
    });
  };

  const buildGrowthBars = (startingBudget, monthGrowthRate, cpc, conversionRate, closeRate, averageSale) => {
    const months = 12;
    const monthlyRevenue = [];
    let rollingBudget = startingBudget;

    for (let i = 0; i < months; i += 1) {
      const clicks = rollingBudget / cpc;
      const leads = clicks * (conversionRate / 100);
      const customers = leads * (closeRate / 100);
      const revenue = customers * averageSale;
      monthlyRevenue.push(revenue);
      rollingBudget *= 1 + monthGrowthRate / 100;
    }

    const maxRevenue = Math.max(...monthlyRevenue);
    growthBars.innerHTML = "";

    monthlyRevenue.forEach((value, index) => {
      const percent = maxRevenue > 0 ? Math.max((value / maxRevenue) * 100, 4) : 4;
      const col = document.createElement("div");
      col.className = "growth-col";
      col.innerHTML = `
        <div class="growth-bar" style="height:${percent}%;" title="Month ${index + 1}: ${formatMoney(value)}"></div>
        <span class="growth-month">M${index + 1}</span>
      `;
      growthBars.appendChild(col);
    });

    const monthOne = monthlyRevenue[0] || 0;
    const monthTwelve = monthlyRevenue[11] || 0;
    const growthPercent = monthOne > 0 ? (((monthTwelve - monthOne) / monthOne) * 100) : 0;
    growthSummary.textContent = `12-month projection: ${formatMoney(monthOne)} to ${formatMoney(monthTwelve)} monthly revenue (${growthPercent.toFixed(0)}% growth).`;
  };

  const updateMetrics = () => {
    const budget = getNumber("budget");
    const cpc = getNumber("cpc");
    const conversionRate = getNumber("conversionRate");
    const closeRate = getNumber("closeRate");
    const averageSale = getNumber("averageSale");
    const monthGrowth = getNumber("monthGrowth");

    const clicks = budget / cpc;
    const leads = clicks * (conversionRate / 100);
    const customers = leads * (closeRate / 100);
    const revenue = customers * averageSale;
    const roas = budget > 0 ? revenue / budget : 0;
    const cac = customers > 0 ? budget / customers : 0;

    metrics.clicks.textContent = formatCount(clicks);
    metrics.leads.textContent = formatCount(leads);
    metrics.customers.textContent = formatCount(customers);
    metrics.revenue.textContent = formatMoney(revenue);
    metrics.roas.textContent = `${roas.toFixed(1)}x`;
    metrics.cac.textContent = customers > 0 ? formatMoney(cac) : "$0";

    buildGrowthBars(budget, monthGrowth, cpc, conversionRate, closeRate, averageSale);
  };

  const refresh = () => {
    updateControlLabels();
    updateMetrics();
  };

  controls.forEach((control) => {
    const input = document.getElementById(control.id);
    if (input) {
      input.addEventListener("input", refresh);
    }
  });

  refresh();
})();
