let allEmployees = [];
let importantPhones = [];
let lineDrivers = [];
let sortColumn = "name";
let sortDirection = "asc";

const BASE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvfC_z7gXOHelvb3qTiNXXlefpXXGORLl3CotjsxCHsKJVjwz0kA1VtbrC2FBB1rBz/exec";
const IMPORTANT_PHONES_URL = `${BASE_APPS_SCRIPT_URL}?type=important_phones`;
const EMPLOYEES_URL = `${BASE_APPS_SCRIPT_URL}?type=employees`;
const LINE_DRIVERS_URL = `${BASE_APPS_SCRIPT_URL}?type=line_drivers`;

async function loadImportantPhones() {
  try {
    const response = await fetch(IMPORTANT_PHONES_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    importantPhones = await response.json();
    renderImportantPhones(importantPhones);
  } catch (error) {
    console.error("Error loading important phones:", error);
    document.getElementById("errorMessage").classList.remove("d-none");
    throw error;
  }
}

function renderImportantPhones(phones) {
  const phonesList = document.getElementById("importantPhonesList");
  phonesList.innerHTML = `
        <table class="important-phones-table">
            <thead>
                <tr>
                    <th>ישוב</th>
                    <th>או"ק</th>
                    <th>טלפון</th>
                </tr>
            </thead>
            <tbody>
                ${phones
                  .map(
                    (phone) => `
                    <tr>
                        <td>${phone.settlement || ""}</td>
                        <td>${phone.command || ""}</td>
                        <td class="phone-cell">
                            ${phone.phone ? `<a href="tel:${(phone.phone || "").replace(/[^0-9]/g, "")}">${phone.phone}</a>` : ""}
                        </td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;
}

async function loadLineDrivers() {
  try {
    const response = await fetch(LINE_DRIVERS_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    lineDrivers = await response.json();
    renderLineDrivers(lineDrivers);
  } catch (error) {
    console.error("Error loading line drivers:", error);
    document.getElementById("errorMessage").classList.remove("d-none");
    throw error;
  }
}

function renderLineDrivers(drivers) {
  const driversList = document.getElementById("lineDriversList");
  const driversToggle = document.getElementById("lineDriversToggle");
  if (drivers.length === 0) {
    driversToggle.classList.add("d-none");
    driversList.innerHTML = "";
    return;
  }
  driversToggle.classList.remove("d-none");
  driversList.innerHTML = `
        <table class="line-drivers-table">
            <thead>
                <tr>
                    <th>שם</th>
                    <th>טלפון</th>
                </tr>
            </thead>
            <tbody>
                ${drivers
                  .map(
                    (driver) => `
                    <tr>
                        <td>${driver.name || ""}</td>
                        <td class="phone-cell">
                            ${driver.phone ? `<a href="tel:${(driver.phone || "").replace(/[^0-9]/g, "")}">${driver.phone}</a>` : ""}
                        </td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;
}

async function loadEmployees() {
  try {
    const response = await fetch(EMPLOYEES_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    allEmployees = await response.json();
    renderEmployees(sortEmployees(allEmployees));
    updateSortIcons();
  } catch (error) {
    console.error("Error loading employees:", error);
    document.getElementById("errorMessage").classList.remove("d-none");
    throw error;
  }
}

function renderEmployees(employees) {
  const tableBody = document.getElementById("employeeTable");
  tableBody.innerHTML = "";
  employees.forEach((employee) => {
    const row = document.createElement("tr");
    const phone = (employee.phone || "").replace(/[^0-9]/g, "");
    const whatsappPhone = phone ? `+972${phone.replace(/^0/, "")}` : "";
    row.innerHTML = `
            <td>${employee.name || ""}</td>
            <td class="phone-cell">
                ${phone ? `<a href="tel:${phone}">${employee.phone}</a>` : employee.phone || ""}
                ${phone ? `<a href="https://wa.me/${whatsappPhone}" target="_blank"><i class="fab fa-whatsapp whatsapp-icon"></i></a>` : ""}
            </td>
            <td>${employee.department || ""}</td>
        `;
    tableBody.appendChild(row);
  });
}

function filterEmployees() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filteredEmployees = allEmployees.filter((employee) => {
    const name = (employee.name || "").toString().toLowerCase();
    const phone = (employee.phone || "").toString().toLowerCase();
    const department = (employee.department || "").toString().toLowerCase();
    return name.includes(searchTerm) || phone.includes(searchTerm) || department.includes(searchTerm);
  });
  renderEmployees(sortEmployees(filteredEmployees));
}

function sortTable(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortColumn = column;
    sortDirection = "asc";
  }
  updateSortIcons();
  renderEmployees(sortEmployees(allEmployees));
}

function sortEmployees(employees) {
  return [...employees].sort((a, b) => {
    const valueA = (a[sortColumn] || "").toString().toLowerCase();
    const valueB = (b[sortColumn] || "").toString().toLowerCase();
    if (sortDirection === "asc") {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });
}

function updateSortIcons() {
  document.querySelectorAll(".sort-icon").forEach((icon) => {
    icon.classList.remove("asc", "desc");
  });
  const activeIcon = document.querySelector(`th[onclick="sortTable('${sortColumn}')"] .sort-icon`);
  if (activeIcon) {
    activeIcon.classList.add(sortDirection);
  }
}

function toggleImportantPhones() {
  const phonesList = document.querySelector(".important-phones");
  const toggleIcon = document.querySelector(".important-phones-toggle .toggle-icon");
  phonesList.classList.toggle("collapsed");
  if (phonesList.classList.contains("collapsed")) {
    toggleIcon.classList.remove("fa-chevron-up");
    toggleIcon.classList.add("fa-chevron-down");
  } else {
    toggleIcon.classList.remove("fa-chevron-down");
    toggleIcon.classList.add("fa-chevron-up");
  }
}

function toggleLineDrivers() {
  const driversList = document.querySelector(".line-drivers");
  const toggleIcon = document.querySelector(".line-drivers-toggle .toggle-icon");
  driversList.classList.toggle("collapsed");
  if (driversList.classList.contains("collapsed")) {
    toggleIcon.classList.remove("fa-chevron-up");
    toggleIcon.classList.add("fa-chevron-down");
  } else {
    toggleIcon.classList.remove("fa-chevron-down");
    toggleIcon.classList.add("fa-chevron-up");
  }
}

async function loadAllData() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  loadingOverlay.classList.add("active");
  try {
    await Promise.all([loadEmployees(), loadImportantPhones(), loadLineDrivers()]);
  } catch (error) {
    // הצגת הודעת שגיאה כבר מטופלת בפונקציות loadEmployees, loadImportantPhones, loadLineDrivers
  } finally {
    loadingOverlay.classList.remove("active");
  }
}

loadAllData();
