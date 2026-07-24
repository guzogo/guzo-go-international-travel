import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm";

import {
    auth,
    getApplications,
    updateApplicationStatus,
    deleteApplication
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ==========================================
// Guzo Go International Admin Dashboard
// Version 2.0 Professional
// ==========================================

// HTML Elements

const table = document.getElementById("applicationsTable");

const totalApps = document.getElementById("totalApps");
const approvedApps = document.getElementById("approvedApps");
const pendingApps = document.getElementById("pendingApps");
const rejectedApps = document.getElementById("rejectedApps");

const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");

const detailsModal = document.getElementById("detailsModal");
const detailsContent = document.getElementById("detailsContent");
const closeModal = document.querySelector(".close");

// Store All Applications

let allApplications = [];

// Company Information

const COMPANY = {
    name: "Guzo Go International Travel & Visa Consultancy",
    email: "guzogointernational@gmail.com",
    phone: "+251942188994",
    website: "https://guzogo.github.io/guzo-go-international-travel/",
    logo: "IMG_20260724_195618_814.jpg"
};

// ==========================================
// Authentication
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "admin-login.html";
        return;

    }

    loadApplications();

});
// ==========================================
// Load Applications
// ==========================================

async function loadApplications() {

    allApplications = await getApplications();

    displayApplications(allApplications);

}

// ==========================================
// Display Applications
// ==========================================

function displayApplications(applications) {

    table.innerHTML = "";

    let approved = 0;
    let pending = 0;
    let rejected = 0;

    applications.forEach((app) => {

        if (app.status === "Approved") approved++;
        if (app.status === "Pending") pending++;
        if (app.status === "Rejected") rejected++;

        const badgeColor =
            app.status === "Approved"
                ? "#28a745"
                : app.status === "Rejected"
                ? "#dc3545"
                : "#ffc107";

        table.innerHTML += `

<tr>

<td>${app.applicantId}</td>

<td>${app.fullName}</td>

<td>${app.country}</td>

<td>
<span style="
background:${badgeColor};
color:white;
padding:6px 12px;
border-radius:20px;
font-size:13px;
font-weight:bold;">
${app.status}
</span>
</td>

<td>

<button class="view" data-id="${app.id}">
👁 View
</button>

<button class="approve" data-id="${app.id}">
✅ Approve
</button>

<button class="reject" data-id="${app.id}">
❌ Reject
</button>

<button class="letter" data-id="${app.id}">
📄 Approval Letter
</button>

<button class="delete" data-id="${app.id}">
🗑 Delete
</button>

</td>

</tr>

`;

    });

    totalApps.textContent = applications.length;
    approvedApps.textContent = approved;
    pendingApps.textContent = pending;
    rejectedApps.textContent = rejected;

}
// ==========================================
// Search Applications
// ==========================================

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value.toLowerCase();

    const filtered = allApplications.filter((app) => {

        return (

            app.applicantId.toLowerCase().includes(keyword) ||

            app.fullName.toLowerCase().includes(keyword) ||

            app.country.toLowerCase().includes(keyword)

        );

    });

    displayApplications(filtered);

});

// ==========================================
// Button Actions
// ==========================================

document.addEventListener("click", async (e) => {

    // ======================================
    // View Applicant
    // ======================================

    if (e.target.classList.contains("view")) {

        const id = e.target.dataset.id;

        const applicant = allApplications.find(
            app => app.id === id
        );

        if (!applicant) return;

        let prefix = "GV";

        switch (applicant.country) {

            case "Canada":
                prefix = "CA";
                break;

            case "Dubai":
                prefix = "AE";
                break;

            case "Saudi Arabia":
                prefix = "SA";
                break;

            case "Kuwait":
                prefix = "KW";
                break;

            case "Qatar":
                prefix = "QA";
                break;

        }

        const permitId =
            `${prefix}-${applicant.applicantId}`;

        const verifyUrl =
`${COMPANY.website}verify.html?id=${permitId}`;

        const qr =
            await QRCode.toDataURL(verifyUrl);

        detailsContent.innerHTML = `

<div style="font-family:Arial,sans-serif;">

<h2 style="color:#0b4f8a;">
Applicant Details
</h2>

<div style="
background:#f8f9fa;
padding:15px;
border-radius:10px;
margin-bottom:15px;">

<h3>${applicant.fullName}</h3>

<p><b>Applicant ID:</b>
${applicant.applicantId}</p>

<p><b>Permit ID:</b>
${permitId}</p>

<p>
<b>Status:</b>

<span style="
background:
${applicant.status==="Approved"
?"#28a745"
:applicant.status==="Rejected"
?"#dc3545"
:"#ffc107"};
color:white;
padding:5px 10px;
border-radius:20px;">
${applicant.status}
</span>

</p>

</div>

<table style="
width:100%;
border-collapse:collapse;">

<tr><td><b>Passport</b></td><td>${applicant.passport}</td></tr>

<tr><td><b>Country</b></td><td>${applicant.country}</td></tr>

<tr><td><b>Phone</b></td><td>${applicant.phone}</td></tr>

<tr><td><b>Email</b></td><td>${applicant.email}</td></tr>

<tr><td><b>Date of Birth</b></td><td>${applicant.dob}</td></tr>

<tr><td><b>Gender</b></td><td>${applicant.gender}</td></tr>

<tr><td><b>Occupation</b></td><td>${applicant.occupation}</td></tr>

<tr><td><b>Address</b></td><td>${applicant.address}</td></tr>

</table>

<div style="
text-align:center;
margin-top:20px;">

<img src="${qr}" width="170">

<p>
<b>Scan To Verify Permit</b>
</p>

</div>

</div>

`;

 detailsModal.style.display = "block";

 }
    // ======================================
    // Approve
    // ======================================

    if (e.target.classList.contains("approve")) {

        const id = e.target.dataset.id;

        const success = await updateApplicationStatus(id, "Approved");

        if (success) {

            loadApplications();

        }

    }

    // ======================================
    // Approval Letter
    // ======================================

    if (e.target.classList.contains("letter")) {

        const id = e.target.dataset.id;

        const applicant = allApplications.find(app => app.id === id);

        if (!applicant) return;

        let prefix = "GV";

        switch (applicant.country) {

            case "Canada":
                prefix = "CA";
                break;

            case "Dubai":
                prefix = "AE";
                break;

            case "Saudi Arabia":
                prefix = "SA";
                break;

            case "Kuwait":
                prefix = "KW";
                break;

            case "Qatar":
                prefix = "QA";
                break;

        }

        const permitId = `${prefix}-${applicant.applicantId}`;

        const verifyUrl =
`${COMPANY.website}verify.html?id=${permitId}`;

        const qr = await QRCode.toDataURL(verifyUrl);

        const letterWindow = window.open("", "_blank");

        letterWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Application Acceptance Letter</title>

<style>

body{

font-family:Arial,sans-serif;

padding:40px;

line-height:1.8;

color:#333;

}

.header{

text-align:center;

border-bottom:3px solid #0b4f8a;

padding-bottom:20px;

margin-bottom:30px;

}

.header img{

width:90px;

}

.header h1{

margin:10px 0;

color:#0b4f8a;

}

.header p{

margin:4px;

color:#666;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

td{

border:1px solid #ddd;

padding:10px;

}

</style>

</head>

<body>

<div class="header">

<img src="${COMPANY.logo}">

<h1>${COMPANY.name}</h1>

<p>Professional Travel & Visa Consultancy</p>

<p>📧 ${COMPANY.email}</p>

<p>☎ ${COMPANY.phone}</p>

</div>

<h2 style="text-align:center;color:#1b5e20;">

APPLICATION ACCEPTANCE LETTER

</h2>

<p><b>Date:</b> ${new Date().toLocaleDateString()}</p>

<p><b>Applicant ID:</b> ${applicant.applicantId}</p>

<p><b>Permit ID:</b> ${permitId}</p>

<hr>

<p>

Dear <b>${applicant.fullName}</b>,

</p>

<p>

We are pleased to inform you that your application has been accepted for processing by <b>${COMPANY.name}</b>.

</p>
<p>

Following our initial review, your application has successfully passed the preliminary assessment and has been accepted for processing.

</p>

<p>

To begin the processing, the applicant is required to pay <b>25%</b> of the agreed service fee. The remaining <b>75%</b> will be paid according to the agreed processing schedule.

</p>

<h3>Applicant Information</h3>

<table>

<tr>
<td><b>Applicant Name</b></td>
<td>${applicant.fullName}</td>
</tr>

<tr>
<td><b>Passport Number</b></td>
<td>${applicant.passport}</td>
</tr>

<tr>
<td><b>Destination Country</b></td>
<td>${applicant.country}</td>
</tr>

<tr>
<td><b>Status</b></td>
<td style="color:green;"><b>${applicant.status}</b></td>
</tr>

<tr>
<td><b>Permit ID</b></td>
<td>${permitId}</td>
</tr>

</table>

<br>

<p>

<strong>Important Notice</strong><br>

This letter confirms only that your application has been accepted for processing by <b>${COMPANY.name}</b>. Final visa, work permit or immigration approval remains under the authority of the relevant Embassy or Immigration Department.

</p>

<div style="text-align:center;margin-top:35px;">

<img src="${qr}" width="170">

<p><b>Scan to Verify Approval Letter</b></p>

<p style="font-size:12px;color:#666;">

${verifyUrl}

</p>

</div>

<div style="margin-top:60px;">

_____________________________<br>

<b>Authorized Officer</b><br>

${COMPANY.name}

</div>

<hr style="margin-top:40px;">

<div style="text-align:center;color:#777;font-size:13px;">

© 2026 ${COMPANY.name}<br>

📧 ${COMPANY.email}<br>

☎ ${COMPANY.phone}

</div>

<script>

window.print();

</script>

</body>

</html>

`);

letterWindow.document.close();

}
    // ======================================
    // Reject
    // ======================================

    if (e.target.classList.contains("reject")) {

        const id = e.target.dataset.id;

        const success = await updateApplicationStatus(id, "Rejected");

        if (success) {

            alert("Application Rejected Successfully.");

            loadApplications();

        }

    }

    // ======================================
    // Delete Application
    // ======================================

    if (e.target.classList.contains("delete")) {

        const ok = confirm(
            "Are you sure you want to permanently delete this application?"
        );

        if (!ok) return;

        const id = e.target.dataset.id;

        const success = await deleteApplication(id);

        if (success) {

            alert("Application Deleted Successfully.");

            loadApplications();

        } else {

            alert("Delete Failed.");

        }

    }

}); // End document click listener

// ==========================================
// Close Details Modal
// ==========================================

closeModal.addEventListener("click", () => {

    detailsModal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === detailsModal) {

        detailsModal.style.display = "none";

    }

});

// ==========================================
// Logout
// ==========================================

logoutBtn.addEventListener("click", async () => {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    try {

        await signOut(auth);

        window.location.href = "admin-login.html";

    } catch (error) {

        console.error(error);

        alert("Logout failed.");

    }

});

// ==========================================
// End of Guzo Go Admin Dashboard v2.0
// ==========================================    
