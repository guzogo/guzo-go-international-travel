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

// ===============================
// HTML Elements
// ===============================

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

// ===============================
// Store Applications
// ===============================

let allApplications = [];

// ===============================
// Admin Authentication
// ===============================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "admin-login.html";
        return;

    }

    loadApplications();

});

// ===============================
// Load Applications
// ===============================

async function loadApplications() {

    allApplications = await getApplications();

    displayApplications(allApplications);

  }
// ===============================
// Display Applications
// ===============================

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

               <button class="view" data-id="${app.id}">
    View
</button>

<button class="approve" data-id="${app.id}">
    Approve
</button>

<button class="reject" data-id="${app.id}">
    Reject
</button>

<button class="letter" data-id="${app.id}">
    Approval Letter
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

// ===============================
// Search Applications
// ===============================

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
// ===============================
// Button Actions
// ===============================

document.addEventListener("click", async (e) => {

    // ===========================
    // View Applicant
    // ===========================

    if (e.target.classList.contains("view")) {

        const id = e.target.dataset.id;

        const applicant = allApplications.find(app => app.id === id);

        if (!applicant) return;

        // Generate Permit ID

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

        // QR Code

        const verifyUrl =
        `https://guzogo.github.io/guzo-go-international-travel/verify.html?id=${permitId}`;

        const qr = await QRCode.toDataURL(verifyUrl);

        detailsContent.innerHTML = `

<div style="font-family:Arial,sans-serif;">

<h2 style="margin-bottom:15px;color:#0b4f8a;">
Applicant Details
</h2>

<div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:15px;">

<h3 style="margin:0;">${applicant.fullName}</h3>

<p style="margin:5px 0;">
<b>Applicant ID:</b> ${applicant.applicantId}
</p>

<p style="margin:5px 0;">
<b>Permit ID:</b> ${permitId}
</p>

<p style="margin:5px 0;">
<b>Status:</b>

<span style="
background:${applicant.status=="Approved"?"#28a745":applicant.status=="Rejected"?"#dc3545":"#ffc107"};
color:white;
padding:4px 10px;
border-radius:20px;
font-size:13px;">
${applicant.status}
</span>

</p>

</div>

<table style="width:100%;border-collapse:collapse;">

<tr><td><b>Passport</b></td><td>${applicant.passport}</td></tr>

<tr><td><b>Country</b></td><td>${applicant.country}</td></tr>

<tr><td><b>Phone</b></td><td>${applicant.phone}</td></tr>

<tr><td><b>Email</b></td><td>${applicant.email}</td></tr>

<tr><td><b>Date of Birth</b></td><td>${applicant.dob}</td></tr>

<tr><td><b>Gender</b></td><td>${applicant.gender}</td></tr>

<tr><td><b>Occupation</b></td><td>${applicant.occupation}</td></tr>

<tr><td><b>Address</b></td><td>${applicant.address}</td></tr>

</table>

<div style="text-align:center;margin-top:25px;">

<img src="${qr}" width="160">

<p style="margin-top:10px;">
Scan to Verify Permit
</p>

</div>

</div>

`;

 detailsModal.style.display = "block";

    }

    // ===========================
    // Approve
    // ===========================

    if (e.target.classList.contains("approve")) {

        const id = e.target.dataset.id;

        const success = await updateApplicationStatus(id, "Approved");

        if (success) {

            loadApplications();

        }

    }
// ===========================
// Approval Letter
// ===========================

if (e.target.classList.contains("letter")) {

    const id = e.target.dataset.id;

    const applicant = allApplications.find(app => app.id === id);

    if (!applicant) return;

    const letterWindow = window.open("", "_blank");

    letterWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Letter - Guzo Go</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
            background-color: #f4f6f9;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .letter-container {
            background-color: #ffffff;
            width: 100%;
            max-width: 700px;
            padding: 40px;
            border: 1px solid #e1e4e8;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-top: 8px solid #0056b3; /* የጉዞ ጎ መለያ ሰማያዊ ቀለም */
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }
        .logo-placeholder {
            font-size: 24px;
            font-weight: bold;
            color: #0056b3;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .company-name {
            font-size: 20px;
            font-weight: 600;
            color: #222;
        }
        .company-sub {
            font-size: 14px;
            color: #666;
            margin-top: 3px;
        }
        .doc-title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            color: #333;
            letter-spacing: 1px;
            margin: 25px 0;
        }
        .meta-info {
            font-size: 15px;
            margin-bottom: 20px;
            color: #444;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .info-table td {
            padding: 10px 0;
            font-size: 15px;
            color: #333;
        }
        .info-table td.label {
            font-weight: 600;
            width: 30%;
            color: #555;
        }
        .status-badge {
            background-color: #e6f4ea;
            color: #137333;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            border: 1px solid #c2e7cd;
            display: inline-block;
        }
        .divider {
            border-top: 1px dashed #bbb;
            margin: 20px 0;
        }
        .letter-body {
            font-size: 15px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 30px;
        }
        .letter-body p {
            margin-bottom: 15px;
        }
        .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 40px;
        }
        .auth-side {
            font-size: 15px;
        }
        .auth-title {
            font-weight: 600;
            margin-bottom: 35px;
            color: #444;
        }
        .company-signature {
            font-weight: bold;
            color: #0056b3;
        }
        .qr-side {
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .qr-code {
            width: 100px;
            height: 100px;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 8px auto;
            font-weight: bold;
            color: #555;
        }
        .verify-link {
            color: #0056b3;
            text-decoration: none;
            font-weight: 500;
        }
        .contact-info {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            font-size: 13px;
            color: #666;
            line-height: 1.5;
        }
    </style>
</head>
<body>

<div class="letter-container">
    <!-- Header -->
    <div class="header">
        <div class="logo-placeholder">🌍 Guzo Go</div>
        <div class="company-name">Guzo Go International Travel & Visa Consultancy</div>
        <div class="company-sub">Professional Travel & Visa Services</div>
    </div>

    <!-- Document Title -->
    <div class="doc-title">APPLICATION STATUS LETTER</div>

    <!-- Date -->
    <div class="meta-info">
        <strong>Date:</strong> 24 July 2026
    </div>

    <!-- Applicant Info Table -->
    <table class="info-table">
        <tr>
            <td class="label">Applicant ID</td>
            <td>: GG-123456</td>
        </tr>
        <tr>
            <td class="label">Full Name</td>
            <td>: Dawid Mohammed Adem</td>
        </tr>
        <tr>
            <td class="label">Passport No.</td>
            <td>: XXXXXXXX</td>
        </tr>
        <tr>
            <td class="label">Country</td>
            <td>: 🇨🇦 Canada</td>
        </tr>
        <tr>
            <td class="label">Status</td>
            <td>: <span class="status-badge">Approved for Next Processing Stage</span></td>
        </tr>
    </table>

    <div class="divider"></div>

    <!-- Letter Body -->
    <div class="letter-body">
        <p>Dear Applicant,</p>
        <p>Thank you for submitting your application through <strong>Guzo Go International Travel & Visa Consultancy</strong>.</p>
        <p>Your application has successfully completed our initial review and has been accepted to proceed to the next stage of processing.</p>
        <p>Please note that this letter confirms only the status of your application within our recruitment process. Any visa, work permit, or immigration decision remains the responsibility of the relevant government authorities.</p>
    </div>

    <div class="divider"></div>

    <!-- Footer Signatures & QR -->
    <div class="footer-section">
        <div class="auth-side">
            <div class="auth-title">Authorized Officer</div>
            <div class="company-signature">Guzo Go International Travel & Visa Consultancy</div>
        </div>
        
        <div class="qr-side">
            <!-- QR code ቦታ (ትክክለኛ ምስል እዚህ መተካት ይችላሉ) -->
            <div class="qr-code">[ QR CODE ]</div>
            <div>Verify at:</div>
            <div><a class="verify-link" href="https://github.io" target="_blank">guzogo.github.io/...</a></div>
        </div>
    </div>

    <!-- Contact Info -->
    <div class="contact-info">
        <strong>Email:</strong> info@guzogotravel.com<br>
        <strong>Website:</strong> guzogo.github.io/guzo-go-international-travel
    </div>
</div>

</body>
</html>

`);

}
    // ===========================
    // Reject
    // ===========================

    if (e.target.classList.contains("reject")) {

        const id = e.target.dataset.id;

        const success = await updateApplicationStatus(id, "Rejected");

        if (success) {

            loadApplications();

        }

    }
// Delete Application

if (e.target.classList.contains("delete")) {

    alert("Delete button clicked");

    const ok = confirm("Are you sure you want to delete this application?");
    if (!ok) return;

    const id = e.target.dataset.id;

    console.log(id);

    const success = await deleteApplication(id);

    alert(success);

    loadApplications();

}

                          
});
// ===============================
// Close Details Modal
// ===============================

closeModal.addEventListener("click", () => {

    detailsModal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === detailsModal) {

        detailsModal.style.display = "none";

    }

});

// ===============================
// Logout
// ===============================

logoutBtn.addEventListener("click", async () => {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    try {

        await signOut(auth);

        window.location.href = "admin-login.html";

    } catch (error) {

        alert("Logout failed.");

        console.error(error);

    }

});
