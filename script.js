 
"use strict";

/* ==========================================
   SMART ELECTRICITY MANAGEMENT SYSTEM
   Version 1.0
   ========================================== */

const $ = (id) => document.getElementById(id);

const stateNames = {
    AP: "Andhra Pradesh",
    TS: "Telangana",
    TN: "Tamil Nadu"
};

/*
 * DEMONSTRATION TARIFFS ONLY.
 * These are NOT official electricity rates.
 * Replace with verified official tariff schedules.
 */
const tariffs = {
    AP: { rate: 5.00, fixed: 50 },
    TS: { rate: 5.20, fixed: 60 },
    TN: { rate: 4.80, fixed: 40 }
};

const districts = {
    AP: [
        "Alluri Sitharama Raju", "Anakapalli", "Anantapur",
        "Annamayya", "Bapatla", "Chittoor",
        "Dr B R Ambedkar Konaseema", "East Godavari",
        "Eluru", "Guntur", "Kakinada", "Krishna",
        "Kurnool", "Nandyal", "NTR", "Palnadu",
        "Parvathipuram Manyam", "Prakasam",
        "Sri Potti Sriramulu Nellore", "Sri Sathya Sai",
        "Srikakulam", "Tirupati", "Visakhapatnam",
        "Vizianagaram", "West Godavari", "YSR Kadapa"
    ],
    TS: [
        "Adilabad", "Bhadradri Kothagudem", "Hanamkonda",
        "Hyderabad", "Jagtial", "Jangaon",
        "Jayashankar Bhupalpally", "Jogulamba Gadwal",
        "Kamareddy", "Karimnagar", "Khammam",
        "Kumuram Bheem", "Mahabubabad", "Mahabubnagar",
        "Mancherial", "Medak", "Medchal-Malkajgiri",
        "Mulugu", "Nagarkurnool", "Nalgonda",
        "Narayanpet", "Nirmal", "Nizamabad",
        "Peddapalli", "Rajanna Sircilla", "Rangareddy",
        "Sangareddy", "Siddipet", "Suryapet",
        "Vikarabad", "Wanaparthy", "Warangal",
        "Yadadri Bhuvanagiri"
    ],
    TN: [
        "Ariyalur", "Chengalpattu", "Chennai",
        "Coimbatore", "Cuddalore", "Dharmapuri",
        "Dindigul", "Erode", "Kallakurichi",
        "Kancheepuram", "Kanniyakumari", "Karur",
        "Krishnagiri", "Madurai", "Mayiladuthurai",
        "Nagapattinam", "Namakkal", "Nilgiris",
        "Perambalur", "Pudukkottai", "Ramanathapuram",
        "Ranipet", "Salem", "Sivaganga", "Tenkasi",
        "Thanjavur", "Theni", "Thoothukudi",
        "Tiruchirappalli", "Tirunelveli", "Tirupathur",
        "Tiruppur", "Tiruvallur", "Tiruvannamalai",
        "Tiruvarur", "Vellore", "Viluppuram",
        "Virudhunagar"
    ]
};

const discoms = {
    AP: ["APEPDCL", "APSPDCL"],
    TS: ["TGSPDCL", "TGNPDCL"],
    TN: ["TNPDCL"]
};

/* ==========================================
   APPLICATION DATA
   ========================================== */

let appliances = [];
let billHistory = [];
let currentBill = null;
let monthlyBudget = 0;

const STORAGE_KEYS = {
    appliances: "sems_appliances",
    history: "sems_history",
    budget: "sems_budget"
};

/* ==========================================
   GENERAL FUNCTIONS
   ========================================== */

function money(value) {
    return "₹" + Number(value).toFixed(2);
}

function units(value) {
    return Number(value).toFixed(2) + " kWh";
}

function showMessage(message) {
    alert(message);
}

function getNumber(id) {
    const element = $(id);

    if (!element || element.value.trim() === "") {
        return NaN;
    }

    return Number(element.value);
}

function addOption(select, value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
}

function validStoredArray(value) {
    return Array.isArray(value) ? value : [];
}

/* ==========================================
   LOCAL STORAGE
   ========================================== */

function loadData() {
    try {
        appliances = validStoredArray(
            JSON.parse(
                localStorage.getItem(STORAGE_KEYS.appliances) || "[]"
            )
        );

        billHistory = validStoredArray(
            JSON.parse(
                localStorage.getItem(STORAGE_KEYS.history) || "[]"
            )
        );

        const storedBudget = Number(
            localStorage.getItem(STORAGE_KEYS.budget) || 0
        );

        monthlyBudget =
            Number.isFinite(storedBudget) && storedBudget >= 0
                ? storedBudget
                : 0;

    } catch (error) {
        appliances = [];
        billHistory = [];
        monthlyBudget = 0;

        console.error("Storage loading error:", error);
    }
}

function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEYS.appliances,
            JSON.stringify(appliances)
        );

        localStorage.setItem(
            STORAGE_KEYS.history,
            JSON.stringify(billHistory)
        );

        localStorage.setItem(
            STORAGE_KEYS.budget,
            String(monthlyBudget)
        );

        return true;

    } catch (error) {
        console.error("Storage saving error:", error);
        showMessage("Unable to save data. Check browser storage.");
        return false;
    }
}

/* ==========================================
   STATE AND DISTRICT SELECTION
   ========================================== */

function setupStateSelection() {
    $("state").addEventListener("change", function () {
        const state = this.value;
        const districtSelect = $("district");
        const discomSelect = $("discom");

        districtSelect.replaceChildren();
        discomSelect.replaceChildren();

        addOption(districtSelect, "", "Choose District");
        addOption(discomSelect, "", "Choose DISCOM");

        districtSelect.disabled = !state;

        if (!state || !districts[state]) {
            $("tariffInformation").textContent =
                "Please select a valid state.";
            return;
        }

        districts[state].forEach(district => {
            addOption(districtSelect, district, district);
        });

        discoms[state].forEach(discom => {
            addOption(discomSelect, discom, discom);
        });

        $("tariffInformation").textContent =
            stateNames[state] +
            " selected. Available districts and demonstration DISCOM options loaded.";
    });
}

/* ==========================================
   ELECTRICITY BILL CALCULATOR
   ========================================== */

function calculateBillAmount(state, consumed, period) {
    const tariff = tariffs[state];

    if (
        !tariff ||
        !Number.isFinite(consumed) ||
        consumed < 0 ||
        !Number.isFinite(period) ||
        period <= 0
    ) {
        return null;
    }

    const energyCharges = consumed * tariff.rate;
    const fixedCharges = tariff.fixed * period;
    const otherCharges = 0;

    return {
        units: consumed,
        energy: energyCharges,
        fixed: fixedCharges,
        other: otherCharges,
        total: energyCharges + fixedCharges + otherCharges,
        rate: tariff.rate
    };
}

function calculateBill() {
    const state = $("state").value;
    const district = $("district").value;
    const discom = $("discom").value;

    const consumed = getNumber("consumedUnits");
    const period = Number($("billingPeriod").value);

    if (!state || !district || !discom) {
        showMessage("Please select state, district and DISCOM.");
        return;
    }

    if (!Number.isFinite(consumed) || consumed < 0) {
        showMessage("Please enter valid electricity units.");
        return;
    }

    if (!Number.isFinite(period) || period <= 0) {
        showMessage("Please select a valid billing period.");
        return;
    }

    const result = calculateBillAmount(
        state,
        consumed,
        period
    );

    if (!result) {
        showMessage("Bill calculation failed.");
        return;
    }

    currentBill = {
        ...result,
        state: state,
        district: district,
        discom: discom,
        period: period,
        date: new Date().toLocaleDateString("en-IN"),
        savedAt: new Date().toISOString()
    };

    $("resultUnits").textContent = units(result.units);
    $("energyCharges").textContent = money(result.energy);
    $("fixedCharges").textContent = money(result.fixed);
    $("otherCharges").textContent = money(result.other);
    $("totalBill").textContent = money(result.total);

    $("tariffSource").textContent =
        "Illustrative flat-rate demonstration. Not an official tariff. " +
        "Actual bills may include slabs, subsidies and additional charges.";

    $("billResult").hidden = false;

    updateDashboard(consumed, result.total);
    updateBudget();
}

/* ==========================================
   SAVE AND DISPLAY BILL HISTORY
   ========================================== */

function saveBill() {
    if (!currentBill) {
        showMessage("Please calculate a bill first.");
        return;
    }

    billHistory.push({ ...currentBill });

    if (saveData()) {
        renderHistory();
        renderChart();
        showMessage("Bill saved successfully.");
    } else {
        billHistory.pop();
    }
}

function renderHistory() {
    const table = $("historyTable");
    table.replaceChildren();

    if (billHistory.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();

        cell.colSpan = 4;
        cell.textContent = "No bill history available.";
        return;
    }

    billHistory.slice().reverse().forEach(bill => {
        const row = table.insertRow();

        const values = [
            bill.date || "-",
            stateNames[bill.state] || bill.state || "-",
            units(Number(bill.units) || 0),
            money(Number(bill.total) || 0)
        ];

        values.forEach(value => {
            const cell = row.insertCell();
            cell.textContent = value;
        });
    });
}

/* ==========================================
   APPLIANCE MANAGEMENT
   ========================================== */

function getMonthlyUnits(appliance) {
    return (
        appliance.power *
        appliance.hours *
        appliance.quantity *
        30
    ) / 1000;
}

function addAppliance() {
    const name = $("applianceName").value.trim();
    const power = getNumber("appliancePower");
    const hours = getNumber("applianceHours");
    const quantity = getNumber("applianceQuantity");

    if (!name) {
        showMessage("Please enter an appliance name.");
        return;
    }

    if (!Number.isFinite(power) || power <= 0) {
        showMessage("Power must be greater than zero.");
        return;
    }

    if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
        showMessage("Daily usage must be between 0 and 24 hours.");
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        showMessage("Quantity must be a positive whole number.");
        return;
    }

    const appliance = {
        id: Date.now() + "-" + Math.random(),
        name: name,
        power: power,
        hours: hours,
        quantity: quantity
    };

    appliances.push(appliance);

    if (saveData()) {
        $("applianceName").value = "";
        $("appliancePower").value = "";
        $("applianceHours").value = "";
        $("applianceQuantity").value = "1";

        renderAppliances();
    } else {
        appliances.pop();
    }
}

function deleteAppliance(id) {
    const previous = appliances;

    appliances = appliances.filter(
        appliance => appliance.id !== id
    );

    if (saveData()) {
        renderAppliances();
    } else {
        appliances = previous;
    }
}

function renderAppliances() {
    const table = $("applianceTable");
    table.replaceChildren();

    let total = 0;
    let highest = null;

    if (appliances.length === 0) {
        const row = table.insertRow();
        const cell = row.insertCell();

        cell.colSpan = 6;
        cell.textContent = "No appliances added yet.";
    }

    appliances.forEach(appliance => {
        const monthly = getMonthlyUnits(appliance);
        total += monthly;

        if (
            !highest ||
            monthly > getMonthlyUnits(highest)
        ) {
            highest = appliance;
        }

        const row = table.insertRow();

        const values = [
            appliance.name,
            appliance.power + " W",
            appliance.hours + " hours",
            appliance.quantity,
            units(monthly)
        ];

        values.forEach(value => {
            const cell = row.insertCell();
            cell.textContent = value;
        });

        const actionCell = row.insertCell();
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = "Delete";
        button.className = "delete-button";

        button.addEventListener("click", () => {
            deleteAppliance(appliance.id);
        });

        actionCell.appendChild(button);
    });

    const daily = total / 30;

    $("totalApplianceUnits").textContent = units(total);
    $("dailyUsage").textContent = units(daily);
    $("monthlyUsage").textContent = units(total);
    $("dashboardUnits").textContent = units(total);
    $("dashboardAppliances").textContent = appliances.length;

    $("highestAppliance").textContent =
        highest ? highest.name : "None";

    renderChart();
}

/* ==========================================
   SEND APPLIANCE UNITS TO BILL CALCULATOR
   ========================================== */

function sendUnitsToBill() {
    const total = appliances.reduce(
        (sum, appliance) => sum + getMonthlyUnits(appliance),
        0
    );

    $("consumedUnits").value = total.toFixed(2);

    $("bill-calculator").scrollIntoView({
        behavior: "smooth"
    });
}

/* ==========================================
   BUDGET MANAGER
   ========================================== */

function saveBudget() {
    const budget = getNumber("monthlyBudget");

    if (!Number.isFinite(budget) || budget <= 0) {
        showMessage("Enter a valid budget greater than zero.");
        return;
    }

    const previous = monthlyBudget;
    monthlyBudget = budget;

    if (saveData()) {
        updateBudget();
        showMessage("Monthly budget saved successfully.");
    } else {
        monthlyBudget = previous;
    }
}

function updateBudget() {
    const bill = currentBill ? currentBill.total : 0;

    if (monthlyBudget <= 0) {
        $("dashboardBudget").textContent = "Not Set";
        $("budgetStatus").textContent = "Not Set";
        $("budgetPercentage").textContent = "0%";
        $("budgetProgress").style.width = "0%";
        $("budgetMessage").textContent =
            "Set your monthly budget to begin.";
        return;
    }

    $("dashboardBudget").textContent = money(monthlyBudget);

    const percentage = (bill / monthlyBudget) * 100;

    $("budgetPercentage").textContent =
        percentage.toFixed(1) + "%";

    $("budgetProgress").style.width =
        Math.min(percentage, 100) + "%";

    if (bill > monthlyBudget) {
        $("budgetStatus").textContent = "Exceeded";
        $("budgetMessage").textContent =
            "Warning: Estimated bill exceeds your budget.";

        $("budgetProgress").style.background = "#d94848";
    } else {
        $("budgetStatus").textContent = "Within Budget";
        $("budgetMessage").textContent =
            "Your estimated bill is within your budget.";

        $("budgetProgress").style.background =
            "linear-gradient(90deg,#1596a8,#36c59b)";
    }
}

/* ==========================================
   DASHBOARD UPDATE
   ========================================== */

function updateDashboard(consumed, bill) {
    $("dashboardUnits").textContent = units(consumed);
    $("dashboardBill").textContent = money(bill);
}

/* ==========================================
   STATE BILL COMPARISON
   ========================================== */

function compareBills() {
    const consumed = getNumber("comparisonUnits");

    if (!Number.isFinite(consumed) || consumed < 0) {
        showMessage("Enter valid comparison units.");
        return;
    }

    const result = $("comparisonResult");
    result.replaceChildren();

    Object.keys(tariffs).forEach(state => {
        const bill = calculateBillAmount(state, consumed, 1);

        const paragraph = document.createElement("p");

        paragraph.textContent =
            stateNames[state] + ": " +
            money(bill.total) +
            " (demo estimate)";

        result.appendChild(paragraph);
    });
}

/* ==========================================
   CSV EXPORT
   ========================================== */

function downloadCSV(filename, rows) {
    const csv = rows.map(row =>
        row.map(value => {
            let text = String(value ?? "");

            // Prevent spreadsheet formula injection.
            if (/^[=+\-@\t\r]/.test(text)) {
                text = "'" + text;
            }

            return '"' + text.replace(/"/g, '""') + '"';
        }).join(",")
    ).join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportHistory() {
    const rows = [
        ["Date", "State", "District", "Units", "Estimated Bill"]
    ];

    billHistory.forEach(bill => {
        rows.push([
            bill.date,
            stateNames[bill.state] || bill.state,
            bill.district,
            bill.units,
            bill.total
        ]);
    });

    downloadCSV("electricity-bill-history.csv", rows);
}

/* ==========================================
   CONSUMPTION CHART
   ========================================== */

function renderChart() {
    const canvas = $("consumptionChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    let data = billHistory.slice();

    const period = $("chartPeriod").value;

    if (period === "weekly") {
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

        data = data.filter(bill =>
            bill.savedAt &&
            new Date(bill.savedAt).getTime() >= cutoff
        );
    } else {
        data = data.slice(-6);
    }

    data = data.map(bill => ({
        value: Number(bill.units),
        date: bill.date || ""
    })).filter(item =>
        Number.isFinite(item.value) && item.value >= 0
    );

    if (data.length === 0) {
        ctx.fillStyle = "#78869b";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Save bills to display consumption",
            width / 2,
            height / 2
        );

        return;
    }

    const max = Math.max(...data.map(item => item.value), 1);
    const padding = 35;
    const chartHeight = height - 65;
    const chartWidth = width - padding * 2;
    const gap = chartWidth / data.length;

    ctx.strokeStyle = "#e5eaf1";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const y = 15 + (chartHeight / 4) * i;

        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    data.forEach((item, index) => {
        const barHeight =
            (item.value / max) * chartHeight;

        const barWidth = Math.min(35, gap * 0.55);

        const x =
            padding + gap * index +
            (gap - barWidth) / 2;

        const y = chartHeight + 15 - barHeight;

        ctx.fillStyle = "#1596a8";
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#78869b";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            item.date,
            x + barWidth / 2,
            height - 12
        );
    });
}

/* ==========================================
   MOBILE NAVIGATION
   ========================================== */

function setupNavigation() {
    $("menuToggle").addEventListener("click", () => {
        $("sidebar").classList.toggle("open");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            document.querySelectorAll(".nav-link").forEach(item => {
                item.classList.remove("active");
            });

            link.classList.add("active");

            $("sidebar").classList.remove("open");
        });
    });
}

/* ==========================================
   EVENT LISTENERS
   ========================================== */

function setupEvents() {
    $("calculateBill").addEventListener("click", calculateBill);
    $("saveBill").addEventListener("click", saveBill);

    $("addAppliance").addEventListener("click", addAppliance);
    $("sendUnitsToBill").addEventListener("click", sendUnitsToBill);

    $("saveBudget").addEventListener("click", saveBudget);
    $("compareBills").addEventListener("click", compareBills);

    $("exportHistory").addEventListener("click", exportHistory);

    $("chartPeriod").addEventListener("change", renderChart);

    window.addEventListener("resize", renderChart);
}

/* ==========================================
   START APPLICATION
   ========================================== */

function initializeApp() {
    const requiredIds = [
        "state", "district", "discom",
        "tariffInformation", "consumedUnits",
        "billingPeriod", "calculateBill",
        "billResult", "resultUnits",
        "energyCharges", "fixedCharges",
        "otherCharges", "totalBill", "tariffSource",
        "saveBill", "historyTable",
        "applianceName", "appliancePower",
        "applianceHours", "applianceQuantity",
        "applianceTable", "totalApplianceUnits",
        "dailyUsage", "monthlyUsage",
        "dashboardUnits", "dashboardBill",
        "dashboardAppliances", "dashboardBudget",
        "highestAppliance", "budgetStatus",
        "monthlyBudget", "budgetPercentage",
        "budgetProgress", "budgetMessage",
        "comparisonUnits", "comparisonResult",
        "consumptionChart", "chartPeriod",
        "menuToggle", "sidebar", "bill-calculator",
        "addAppliance", "saveBudget",
        "compareBills", "exportHistory",
        "sendUnitsToBill"
    ];

    const missing = requiredIds.filter(id => !$(id));

    if (missing.length > 0) {
        console.error("Missing HTML elements:", missing);
        showMessage(
            "Some HTML elements are missing. Check the browser console."
        );
        return;
    }

    loadData();

    setupStateSelection();
    setupNavigation();
    setupEvents();

    if (monthlyBudget > 0) {
        $("monthlyBudget").value = monthlyBudget;
    }

    renderAppliances();
    renderHistory();
    renderChart();
    updateBudget();

    console.log("Smart Electricity Management System initialized.");
}

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
