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

// =======================================
// Guzo Go International Admin Dashboard
// Version 3.0 Professional
// =======================================

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

// =======================================
// Company Information
// =======================================

const COMPANY = {

    name: "Guzo Go International Travel & Visa Consultancy",

    email: "guzogointernational@gmail.com",

    phone: "+251942188994",

    website:
    "https://guzogo.github.io/guzo-go-international-travel/",

    logo: "IMG_20260724_195618_814.jpg"

};
const SIGNATURE =
"https://raw.githubusercontent.com/guzogo/guzo-go-international-travel/main/file_00000000867481f4816ec6f35e1d4c8c.png";

const SEAL =
"https://raw.githubusercontent.com/guzogo/guzo-go-international-travel/main/file_00000000ebcc81f48c8b3617bf707cbc.png";
// =======================================
// Store Applications
// =======================================

let allApplications = [];

// =======================================
// Authentication
// =======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "admin-login.html";

        return;

    }

    loadApplications();

});
// =======================================
// Load Applications
// =======================================

async function loadApplications() {

    try {

        allApplications = await getApplications();

        displayApplications(allApplications);

    } catch (error) {

        console.error(error);

        alert("Failed to load applications.");

    }

}

// =======================================
// Display Applications
// =======================================

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

<td>

<span style="
padding:6px 12px;
border-radius:20px;
font-weight:bold;
color:white;
background:
${app.status==="Approved" ? "#28a745" :
app.status==="Rejected" ? "#dc3545" :
"#ffc107"};
">

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

    totalApps.innerText = applications.length;

    approvedApps.innerText = approved;

    pendingApps.innerText = pending;

    rejectedApps.innerText = rejected;

    }
// =======================================
// Search Applications
// =======================================

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value.toLowerCase().trim();

    const filtered = allApplications.filter((app) => {

        return (
            app.applicantId.toLowerCase().includes(keyword) ||
            app.fullName.toLowerCase().includes(keyword) ||
            app.country.toLowerCase().includes(keyword) ||
            app.status.toLowerCase().includes(keyword)
        );

    });

    displayApplications(filtered);

});

// =======================================
// Button Actions
// =======================================

document.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    const applicant = allApplications.find(app => app.id === id);

    // ==========================
    // View Applicant
    // ==========================

    if (e.target.classList.contains("view")) {

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
`https://guzogo.github.io/guzo-go-international-travel/verify.html?id=${permitId}`;

        const qr = await QRCode.toDataURL(verifyUrl);
        detailsContent.innerHTML = `

<div style="font-family:Arial,sans-serif;padding:20px;">

<div style="text-align:center;">

<img src="${COMPANY.logo}"
style="width:80px;height:80px;object-fit:contain;">

<h2 style="color:#0b4f8a;margin:10px 0 5px;">
${COMPANY.name}
</h2>

<p>${COMPANY.email}</p>
<p>${COMPANY.phone}</p>

<hr>

</div>

<h3 style="color:#0b4f8a;">
Applicant Details
</h3>

<table style="width:100%;border-collapse:collapse;">

<tr>
<td><b>Applicant ID</b></td>
<td>${applicant.applicantId}</td>
</tr>

<tr>
<td><b>Full Name</b></td>
<td>${applicant.fullName}</td>
</tr>

<tr>
<td><b>Passport</b></td>
<td>${applicant.passport}</td>
</tr>

<tr>
<td><b>Country</b></td>
<td>${applicant.country}</td>
</tr>

<tr>
<td><b>Email</b></td>
<td>${applicant.email}</td>
</tr>

<tr>
<td><b>Phone</b></td>
<td>${applicant.phone}</td>
</tr>

<tr>
<td><b>Date of Birth</b></td>
<td>${applicant.dob}</td>
</tr>

<tr>
<td><b>Gender</b></td>
<td>${applicant.gender}</td>
</tr>

<tr>
<td><b>Occupation</b></td>
<td>${applicant.occupation}</td>
</tr>

<tr>
<td><b>Address</b></td>
<td>${applicant.address}</td>
</tr>

<tr>
<td><b>Permit ID</b></td>
<td>${permitId}</td>
</tr>

<tr>
<td><b>Status</b></td>
<td>

<span style="
background:${applicant.status==="Approved"?"#28a745":applicant.status==="Rejected"?"#dc3545":"#ffc107"};
color:white;
padding:6px 12px;
border-radius:20px;
font-weight:bold;">

${applicant.status}

</span>

</td>
</tr>

</table>

<div style="text-align:center;margin-top:25px;">

<img src="${qr}" width="160">

<p><b>Scan to Verify Permit</b></p>

</div>

</div>

`;

   detailsModal.style.display = "block";

    return;

    }
    // ===========================
    // Approve Application
    // ===========================

    if (e.target.classList.contains("approve")) {

        const success = await updateApplicationStatus(id, "Approved");

        if (success) {

            alert("Application Approved Successfully");

            loadApplications();

        }

        return;

    }

    // ===========================
    // Reject Application
    // ===========================

    if (e.target.classList.contains("reject")) {

        const success = await updateApplicationStatus(id, "Rejected");

        if (success) {

            alert("Application Rejected");

            loadApplications();

        }

        return;

    }

    // ===========================
    // Approval Letter
    // ===========================

    if (e.target.classList.contains("letter")) {

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
`https://guzogo.github.io/guzo-go-international-travel/verify.html?id=${permitId}`;

        const qr = await QRCode.toDataURL(verifyUrl);

        const letterWindow = window.open("", "_blank");
         letterWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Approval Letter</title>

<style>

body{

font-family:Arial,sans-serif;

padding:50px;

line-height:1.8;

color:#222;

background:white;

}

.header{

text-align:center;

border-bottom:3px solid #0b4f8a;

padding-bottom:15px;

margin-bottom:30px;

}

.logo{

width:80px;

height:80px;

object-fit:contain;

}

.company{

font-size:28px;

font-weight:bold;

color:#0b4f8a;

margin-top:10px;

}

.contact{

font-size:14px;

color:#666;

}

.title{

margin-top:25px;

font-size:30px;

font-weight:bold;

color:#1b5e20;

text-align:center;

}

.badge{

display:inline-block;

padding:8px 18px;

background:#28a745;

color:white;

border-radius:30px;

font-weight:bold;

margin-top:15px;

}

table{

width:100%;

border-collapse:collapse;

margin-top:25px;

}

td{

border:1px solid #ddd;

padding:12px;

}

.footer{

margin-top:40px;

border-top:1px solid #ddd;

padding-top:20px;

text-align:center;

font-size:13px;

color:#666;

}

.watermark{

position:fixed;

top:40%;

left:20%;

font-size:90px;

font-weight:bold;

color:rgba(0,0,0,.05);

transform:rotate(-30deg);

z-index:-1;

}

</style>

</head>

<body>

<div class="watermark">

GUZO GO

</div>

<div class="header">

<img src="${COMPANY.logo}" class="logo">

<div class="company">

${COMPANY.name}

</div>

<div class="contact">

📧 ${COMPANY.email}<br>

☎ ${COMPANY.phone}<br>

🌐 ${COMPANY.website}

</div>

</div>

<div class="title">

APPLICATION ACCEPTANCE LETTER

</div>

<div style="text-align:center;">

<span class="badge">

VERIFIED & AUTHORIZED

</span>

</div>

<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<p><strong>Applicant ID:</strong> ${applicant.applicantId}</p>

<p><strong>Permit ID:</strong> ${permitId}</p>

<p>

Dear <strong>${applicant.fullName}</strong>,

</p>

<p>

We are pleased to inform you that your application has been officially accepted for processing by <strong>${COMPANY.name}</strong>.

</p>

<p>

To begin processing, the applicant is required to pay <strong>25%</strong> of the agreed service fee. The remaining balance will be completed according to the agreed payment schedule.

</p>

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

<td><b>Destination</b></td>

<td>${applicant.country}</td>

</tr>

<tr>

<td><b>Status</b></td>

<td>${applicant.status}</td>

</tr>

<tr>

<td><b>Permit ID</b></td>

<td>${permitId}</td>

</tr>

</table>

<br>

<div style="text-align:center;">

<img src="${qr}" width="170">

<p>

<b>Scan to Verify this Approval Letter</b>

</p>

</div>

<br><br>

<div style="margin-top:45px;">

<img
src="https://raw.githubusercontent.com/guzogo/guzo-go-international-travel/main/file_00000000867481f4816ec6f35e1d4c8c.png"
style="width:220px;display:block;">

<img
src="https://raw.githubusercontent.com/guzogo/guzo-go-international-travel/main/file_00000000ebcc81f48c8b3617bf707cbc.png"
style="width:110px;margin-top:-25px;margin-left:120px;">

<p style="margin-top:10px;font-weight:bold;">
Authorized Officer
</p>

<p>
${COMPANY.name}
</p>

</div>
<div class="footer">

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

return;

} 
    // ===========================
    // Delete Application
    // ===========================

    if (e.target.classList.contains("delete")) {

        const ok = confirm("Are you sure you want to delete this application?");

        if (!ok) return;

        const success = await deleteApplication(id);

        if (success) {

            alert("Application deleted successfully.");

            loadApplications();

        } else {

            alert("Delete failed.");

        }

        return;

    }

});

// =======================================
// Close Details Modal
// =======================================

closeModal.addEventListener("click", () => {

    detailsModal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === detailsModal) {

        detailsModal.style.display = "none";

    }

});

// =======================================
// Logout
// =======================================

logoutBtn.addEventListener("click", async () => {

    const ok = confirm("Are you sure you want to logout?");

    if (!ok) return;

    try {

        await signOut(auth);

        window.location.href = "admin-login.html";

    } catch (error) {

        console.error(error);

        alert("Logout failed.");

    }

});

// =======================================
// End of Guzo Go Admin Dashboard v3.0
// =======================================    
