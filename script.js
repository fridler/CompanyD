let allEmployees = [];
let importantPhones = [];
let sortColumn = "name";
let sortDirection = "asc";

const BASE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzG1VtX8gSt9-r032T3bJQyBTSujKy_xV74b0t8eebDyAnk3zhBrtJqFVR7Xd5wUPll/exec";
const IMPORTANT_PHONES_URL = `${BASE_APPS_SCRIPT_URL}?type=important_phones`;
const EMPLOYEES_URL = `${BASE_APPS_SCRIPT_URL}?type=employees`;

async function loadImportantPhones() {
  try {
    const response = await fetch(IMPORTANT_PHONES_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    importantPhones = await response.json();
    localStorage.setItem("importantPhones", JSON.stringify(importantPhones));
    renderImportantPhones(importantPhones);
  } catch (error) {
    console.error("Error loading important phones:", error);
    document.getElementById("errorMessage").classList.remove("d-none");
    throw error;
  }
}

function renderImportantPhones(phones) {
  const phonesList = document.getElementById("importantPhonesList");
  phonesList.innerHTML = "";
  phones.forEach((phone) => {
    const phoneItem = document.createElement("div");
    phoneItem.className = "phone-item";
    const phoneNumber = (phone.phone || "").replace(/[^0-9]/g, "");
    phoneItem.innerHTML = `
            <span class="phone-name">${phone.name || ""}</span>
            <span class="phone-cell">
                ${phoneNumber ? `<a href="tel:${phoneNumber}">${phone.phone}</a>` : phone.phone || ""}
            </span>
        `;
    phonesList.appendChild(phoneItem);
  });
}

async function loadEmployees() {
  try {
    const response = await fetch(EMPLOYEES_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    allEmployees = await response.json();
    localStorage.setItem("allEmployees", JSON.stringify(allEmployees));
    renderEmployees(sortEmployees(allEmployees));
    updateSortIcons(); // עדכון חץ המיון לאחר טעינה ראשונית
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
  const toggleIcon = document.querySelector(".toggle-icon");
  phonesList.classList.toggle("collapsed");
  if (phonesList.classList.contains("collapsed")) {
    toggleIcon.classList.remove("fa-chevron-up");
    toggleIcon.classList.add("fa-chevron-down");
  } else {
    toggleIcon.classList.remove("fa-chevron-down");
    toggleIcon.classList.add("fa-chevron-up");
  }
}

async function loadAllData() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  const offlineMessage = document.getElementById("offlineMessage");
  loadingOverlay.classList.add("active");
  try {
    await Promise.all([loadEmployees(), loadImportantPhones()]);
    offlineMessage.classList.add("d-none");
  } catch (error) {
    const cachedEmployees = JSON.parse(localStorage.getItem("allEmployees") || "[]");
    const cachedPhones = JSON.parse(localStorage.getItem("importantPhones") || "[]");
    if (cachedEmployees.length > 0 || cachedPhones.length > 0) {
      allEmployees = cachedEmployees;
      importantPhones = cachedPhones;
      renderEmployees(sortEmployees(allEmployees));
      renderImportantPhones(importantPhones);
      offlineMessage.classList.remove("d-none");
    }
  } finally {
    loadingOverlay.classList.remove("active");
  }
}

// רישום Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => console.log("Service Worker registered"))
      .catch((error) => console.error("Service Worker registration failed:", error));
  });
}

loadAllData();
