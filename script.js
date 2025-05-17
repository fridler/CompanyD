let allEmployees = [];
let importantPhones = [];

async function loadImportantPhones() {
  const phonesList = document.getElementById("importantPhonesList");
  phonesList.classList.add("loading");
  try {
    // החלף ב-URL של ה-Web app של Google Apps Script עבור טלפונים חשובים
    const response = await fetch("https://script.google.com/macros/s/AKfycbzG1VtX8gSt9-r032T3bJQyBTSujKy_xV74b0t8eebDyAnk3zhBrtJqFVR7Xd5wUPll/exec?type=important_phones");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    importantPhones = await response.json();
    phonesList.classList.remove("loading");
    renderImportantPhones(importantPhones);
  } catch (error) {
    console.error("Error loading important phones:", error);
    phonesList.classList.remove("loading");
    document.getElementById("errorMessage").classList.remove("d-none");
  }
}

function renderImportantPhones(phones) {
  const phonesList = document.getElementById("importantPhonesList");
  phonesList.innerHTML = "";
  phones.forEach((phone) => {
    const phoneItem = document.createElement("div");
    phoneItem.className = "phone-item";
    const phoneNumber = (phone.phone || "").replace(/[^0-9]/g, ""); // הסרת תווים לא מספריים עבור tel
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
    // החלף ב-URL של ה-Web app של Google Apps Script עבור עובדים
    const response = await fetch("https://script.google.com/macros/s/AKfycbzG1VtX8gSt9-r032T3bJQyBTSujKy_xV74b0t8eebDyAnk3zhBrtJqFVR7Xd5wUPll/exec?type=employees");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    allEmployees = await response.json();
    renderEmployees(allEmployees);
  } catch (error) {
    console.error("Error loading employees:", error);
    document.getElementById("errorMessage").classList.remove("d-none");
  }
}

function renderEmployees(employees) {
  const tableBody = document.getElementById("employeeTable");
  tableBody.innerHTML = "";
  employees.forEach((employee) => {
    const row = document.createElement("tr");
    const phone = (employee.phone || "").replace(/[^0-9]/g, ""); // הסרת תווים לא מספריים
    const whatsappPhone = phone ? `+972${phone.replace(/^0/, "")}` : ""; // הוספת +972 והסרת 0 מתחילת המספר
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
  renderEmployees(filteredEmployees);
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

// טען נתונים מיד עם טעינת הדף
Promise.all([loadEmployees(), loadImportantPhones()]);
