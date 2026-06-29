import {
  auth,
  getApplications,
  updateApplicationStatus
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// =====================
// Elements
// =====================

const table = document.getElementById("applicationsTable");

const totalApps = document.getElementById("totalApps");
const approvedApps = document.getElementById("approvedApps");
const pendingApps = document.getElementById("pendingApps");
const rejectedApps = document.getElementById("rejectedApps");

const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");

// Store all applications
let allApplications = [];
// =====================
// Check Admin Login
// =====================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "admin-login.html";

  }

});

// =====================
// Load Applications
// =====================

async function loadApplications() {

  allApplications = await getApplications();

  displayApplications(allApplications);

}
// =====================
// Display Applications
// =====================

function displayApplications(applications) {

  table.innerHTML = "";

  let approved = 0;
  let pending = 0;
  let rejected = 0;

  applications.forEach((app) => {

    if (app.status === "Approved") approved++;
    if (app.status === "Pending") pending++;
    if (app.status === "Rejected") rejected++;

    table.innerHTML += `

      <tr>

        <td>${app.applicantId}</td>

        <td>${app.fullName}</td>

        <td>${app.country}</td>

        <td>${app.status}</td>

        <td>

          <button class="approve" data-id="${app.id}">
            Approve
          </button>

          <button class="reject" data-id="${app.id}">
            Reject
          </button>

        </td>

      </tr>

    `;

  });

  totalApps.innerText = applications.length;
  approvedApps.innerText = approved;
  pendingApps.innerText = pending;
  rejectedApps.innerText = rejected;

  }
// =====================
// Search Applications
// =====================

searchInput.addEventListener("input", () => {

  const keyword = searchInput.value.toLowerCase();

  const filtered = allApplications.filter((app) => {

    return (
      app.applicantId.toLowerCase().includes(keyword) ||
      app.fullName.toLowerCase().includes(keyword)
    );

  });

  displayApplications(filtered);

});

// =====================
// Approve / Reject
// =====================

document.addEventListener("click", async (e) => {

  if (e.target.classList.contains("approve")) {

    const id = e.target.dataset.id;

    const success = await updateApplicationStatus(id, "Approved");

    if (success) {
      loadApplications();
    }

  }

  if (e.target.classList.contains("reject")) {

    const id = e.target.dataset.id;

    const success = await updateApplicationStatus(id, "Rejected");

    if (success) {
      loadApplications();
    }

  }

});

// =====================
// Logout
// =====================

logoutBtn.addEventListener("click", async () => {

  await signOut(auth);

  window.location.href = "admin-login.html";

});

// =====================
// Start App
// =====================

loadApplications();
