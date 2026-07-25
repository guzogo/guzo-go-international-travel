// ===========================================================
// GUZO GO INTERNATIONAL TRAVEL & VISA CONSULTANCY
// PROFESSIONAL ADMIN DASHBOARD 2026
// admin.js
// PART 1 - Imports, Configuration & Global Variables
// ===========================================================


// ===========================================================
// IMPORTS
// ===========================================================

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


// ===========================================================
// COMPANY INFORMATION
// ===========================================================

const COMPANY = Object.freeze({

    name: "Guzo Go International Travel & Visa Consultancy",

    shortName: "GUZO GO",

    slogan: "Professional Travel & Visa Consultancy",

    email: "guzogointernational@gmail.com",

    phone: "+251942188994",

    website: "https://guzogo.github.io/guzo-go-international-travel/",

    address: "Addis Ababa, Ethiopia",

    logo: "IMG_20260724_195618_814.jpg",

    signature:
        "https://raw.githubusercontent.com/guzogo/guzo-go-international-travel/main/file_00000000867481f4816ec6f35e1d4c8c.png",

    seal:
        "https://raw.githubusercontent.com/guzogo/guzo-go-international-travel/main/file_00000000ebcc81f48c8b3617bf707cbc.png"

});


// ===========================================================
// HTML ELEMENTS
// ===========================================================

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


// ===========================================================
// GLOBAL VARIABLES
// ===========================================================

let applications = [];

let selectedApplication = null;


// ===========================================================
// STATUS
// ===========================================================

const STATUS = {

    APPROVED: "Approved",

    PENDING: "Pending",

    REJECTED: "Rejected"

};


// ===========================================================
// COUNTRY PREFIX
// ===========================================================

const COUNTRY_PREFIX = {

    Canada: "CA",

    USA: "US",

    UK: "GB",

    Germany: "DE",

    France: "FR",

    Italy: "IT",

    Dubai: "AE",

    "Saudi Arabia": "SA",

    Kuwait: "KW",

    Qatar: "QA",

    Oman: "OM",

    Bahrain: "BH"

};


// ===========================================================
// HELPER FUNCTIONS
// ===========================================================

function getPermitId(applicant) {

    const prefix =
        COUNTRY_PREFIX[applicant.country] || "GV";

    return `${prefix}-${applicant.applicantId}`;

}

function getReferenceNumber(applicant) {

    return `GGI-${new Date().getFullYear()}-${applicant.applicantId}`;

}

function formatDate(date = new Date()) {

    return date.toLocaleDateString("en-GB");

}

function getExpiryDate(days = 30) {

    const expiry = new Date();

    expiry.setDate(expiry.getDate() + days);

    return expiry.toLocaleDateString("en-GB");

}

async function createQRCode(url) {

    return await QRCode.toDataURL(url);

}


// ===========================================================
// AUTHENTICATION
// ===========================================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "admin-login.html";

        return;

    }

    initializeDashboard();

});


// ===========================================================
// INITIALIZER
// ===========================================================

async function initializeDashboard() {

    // Part 2

}


// ===========================================================
// END OF PART 1
// ===========================================================
// ===========================================================
// PART 2
// Dashboard Initialization, Statistics & Applications Table
// ===========================================================


// ===========================================================
// INITIALIZE DASHBOARD
// ===========================================================

async function initializeDashboard() {

    try {

        applications = await getApplications();

        renderApplications(applications);

        updateStatistics(applications);

        console.log(
            `Dashboard Loaded (${applications.length} Applications)`
        );

    } catch (error) {

        console.error(error);

        alert("Failed to load applications.");

    }

}


// ===========================================================
// UPDATE DASHBOARD STATISTICS
// ===========================================================

function updateStatistics(list) {

    totalApps.textContent = list.length;

    approvedApps.textContent =
        list.filter(app => app.status === STATUS.APPROVED).length;

    pendingApps.textContent =
        list.filter(app => app.status === STATUS.PENDING).length;

    rejectedApps.textContent =
        list.filter(app => app.status === STATUS.REJECTED).length;

}


// ===========================================================
// RENDER APPLICATION TABLE
// ===========================================================

function renderApplications(list) {

    table.innerHTML = "";

    if (!list.length) {

        table.innerHTML = `
        <tr>
            <td colspan="5"
                style="
                    text-align:center;
                    padding:40px;
                    color:#777;
                    font-weight:bold;
                ">
                No Applications Found
            </td>
        </tr>
        `;

        return;

    }

    list.forEach(app => {

        let badgeColor = "#ffc107";

        if (app.status === STATUS.APPROVED)
            badgeColor = "#198754";

        if (app.status === STATUS.REJECTED)
            badgeColor = "#dc3545";

        table.innerHTML += `

<tr>

<td>${app.applicantId}</td>

<td>${app.fullName}</td>

<td>${app.country}</td>

<td>

<span style="
display:inline-block;
padding:7px 15px;
border-radius:20px;
background:${badgeColor};
color:#fff;
font-weight:bold;
font-size:13px;
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

}


// ===========================================================
// REFRESH DASHBOARD
// ===========================================================

async function refreshDashboard() {

    applications = await getApplications();

    renderApplications(applications);

    updateStatistics(applications);

}


// ===========================================================
// END OF PART 2
// ===========================================================
// ===========================================================
// PART 3
// Search + View Applicant + QR Verification
// ===========================================================


// ===========================================================
// SEARCH
// ===========================================================

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    if (!keyword) {

        renderApplications(applications);

        updateStatistics(applications);

        return;

    }

    const filtered = applications.filter(app =>

        (app.applicantId || "").toLowerCase().includes(keyword) ||

        (app.fullName || "").toLowerCase().includes(keyword) ||

        (app.country || "").toLowerCase().includes(keyword) ||

        (app.status || "").toLowerCase().includes(keyword) ||

        (app.passport || "").toLowerCase().includes(keyword)

    );

    renderApplications(filtered);

    updateStatistics(filtered);

});


// ===========================================================
// BUTTON EVENTS
// ===========================================================

document.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    selectedApplication =
        applications.find(app => app.id === id);

    if (!selectedApplication) return;


    const permitId =
        getPermitId(selectedApplication);

    const verifyUrl =
        `${COMPANY.website}verify.html?id=${permitId}`;

    const qr =
        await createQRCode(verifyUrl);


    // =======================================================
    // VIEW APPLICANT
    // =======================================================

    if (e.target.classList.contains("view")) {

        detailsContent.innerHTML = `

<div style="font-family:Arial,sans-serif;padding:30px;max-width:900px;margin:auto;">

<div style="
display:flex;
justify-content:space-between;
align-items:center;
border-bottom:3px solid #0b4f8a;
padding-bottom:20px;
margin-bottom:25px;
">

<div style="display:flex;align-items:center;">

<img
src="${COMPANY.logo}"
style="
width:90px;
height:90px;
margin-right:20px;
object-fit:contain;
">

<div>

<h2 style="margin:0;color:#0b4f8a;">
${COMPANY.name}
</h2>

<p>${COMPANY.email}</p>

<p>${COMPANY.phone}</p>

</div>

</div>

<img
src="${qr}"
style="
width:120px;
height:120px;
">

</div>


<h2 style="
text-align:center;
color:#0b4f8a;
margin-bottom:25px;
">

Applicant Details

</h2>


<table style="
width:100%;
border-collapse:collapse;
">

<tr><td><b>Applicant ID</b></td><td>${selectedApplication.applicantId}</td></tr>

<tr><td><b>Permit ID</b></td><td>${permitId}</td></tr>

<tr><td><b>Full Name</b></td><td>${selectedApplication.fullName}</td></tr>

<tr><td><b>Passport</b></td><td>${selectedApplication.passport}</td></tr>

<tr><td><b>Country</b></td><td>${selectedApplication.country}</td></tr>

<tr><td><b>Email</b></td><td>${selectedApplication.email}</td></tr>

<tr><td><b>Phone</b></td><td>${selectedApplication.phone}</td></tr>

<tr><td><b>Date of Birth</b></td><td>${selectedApplication.dob}</td></tr>

<tr><td><b>Gender</b></td><td>${selectedApplication.gender}</td></tr>

<tr><td><b>Occupation</b></td><td>${selectedApplication.occupation}</td></tr>

<tr><td><b>Address</b></td><td>${selectedApplication.address}</td></tr>

<tr>

<td><b>Status</b></td>

<td>

<span style="
padding:8px 18px;
border-radius:20px;
font-weight:bold;
color:white;
background:${
selectedApplication.status === STATUS.APPROVED
? "#198754"
: selectedApplication.status === STATUS.REJECTED
? "#dc3545"
: "#ffc107"
};
">

${selectedApplication.status}

</span>

</td>

</tr>

</table>

<div style="
margin-top:35px;
text-align:center;
">

<img
src="${qr}"
style="
width:160px;
height:160px;
">

<p style="margin-top:10px;">
<b>Scan QR Code to Verify</b>
</p>

</div>

</div>

`;

        detailsModal.style.display = "block";

        return;

    }

    // =======================================================
    // Remaining Actions
    // (Approve / Reject / Letter / Delete)
    // Part 4
    // =======================================================

});
    // =======================================================
    // APPROVE APPLICATION
    // =======================================================

    if (e.target.classList.contains("approve")) {

        const ok = confirm(
            `Approve ${selectedApplication.fullName}'s application?`
        );

        if (!ok) return;

        try {

            await updateApplicationStatus(
                selectedApplication.id,
                STATUS.APPROVED
            );

            alert("Application Approved Successfully.");

            await refreshDashboard();

        } catch (error) {

            console.error(error);

            alert("Failed to approve application.");

        }

        return;

    }


    // =======================================================
    // REJECT APPLICATION
    // =======================================================

    if (e.target.classList.contains("reject")) {

        const ok = confirm(
            `Reject ${selectedApplication.fullName}'s application?`
        );

        if (!ok) return;

        try {

            await updateApplicationStatus(
                selectedApplication.id,
                STATUS.REJECTED
            );

            alert("Application Rejected Successfully.");

            await refreshDashboard();

        } catch (error) {

            console.error(error);

            alert("Failed to reject application.");

        }

        return;

    }


    // =======================================================
    // DELETE APPLICATION
    // =======================================================

    if (e.target.classList.contains("delete")) {

        const ok = confirm(
            `Delete ${selectedApplication.fullName}'s application?\n\nThis action cannot be undone.`
        );

        if (!ok) return;

        try {

            await deleteApplication(selectedApplication.id);

            alert("Application Deleted Successfully.");

            await refreshDashboard();

        } catch (error) {

            console.error(error);

            alert("Failed to delete application.");

        }

        return;

    }


    // =======================================================
    // APPROVAL LETTER
    // =======================================================

    if (e.target.classList.contains("letter")) {

        if (selectedApplication.status !== STATUS.APPROVED) {

            alert("Please approve the application first.");

            return;

        }

        // Part 4B

        return;

    }

});
const permitId = getPermitId(selectedApplication);

const referenceNo = getReferenceNumber(selectedApplication);

const issueDate = formatDate();

const expiryDate = getExpiryDate();

const verifyUrl =
`${COMPANY.website}verify.html?id=${permitId}`;

const qr = await createQRCode(verifyUrl);

const letterWindow = window.open("", "_blank");

letterWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<title>Official Approval Letter</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{

font-family:Arial,Helvetica,sans-serif;
background:#f5f5f5;
padding:35px;

}

.page{

max-width:900px;
margin:auto;
background:#fff;
padding:45px;
position:relative;
box-shadow:0 0 20px rgba(0,0,0,.15);

}

.top-bar{

height:10px;
background:#0b4f8a;
margin:-45px -45px 35px;

}

.header{

display:flex;
justify-content:space-between;
align-items:center;
border-bottom:3px solid #0b4f8a;
padding-bottom:20px;

}

.left{

display:flex;
align-items:center;

}

.logo{

width:90px;
height:90px;
object-fit:contain;
margin-right:20px;

}

.company h1{

font-size:28px;
color:#0b4f8a;
margin-bottom:8px;

}

.company p{

font-size:14px;
color:#555;
margin:2px 0;

}

.qr img{

width:120px;

}

.reference{

display:flex;
justify-content:space-between;
margin-top:25px;
font-size:14px;

}

.title{

text-align:center;
font-size:34px;
font-weight:bold;
color:#145a32;
margin-top:35px;

}

.subtitle{

text-align:center;
font-size:15px;
color:#666;
margin-top:8px;

}

.watermark{

position:fixed;
top:40%;
left:12%;
font-size:90px;
font-weight:bold;
color:rgba(0,0,0,.04);
transform:rotate(-28deg);
pointer-events:none;

}

.badge{

width:300px;
margin:30px auto;
background:#198754;
color:#fff;
padding:12px;
border-radius:30px;
text-align:center;
font-weight:bold;

}

.content{

margin-top:35px;
font-size:16px;
line-height:1.9;
text-align:justify;

}

.content p{

margin-bottom:18px;

}

</style>

</head>

<body>

<div class="watermark">

${COMPANY.shortName}

</div>

<div class="page">

<div class="top-bar"></div>

<div class="header">

<div class="left">

<img
src="${COMPANY.logo}"
class="logo">

<div class="company">

<h1>${COMPANY.name}</h1>

<p>${COMPANY.slogan}</p>

<p>${COMPANY.email}</p>

<p>${COMPANY.phone}</p>

<p>${COMPANY.website}</p>

</div>

</div>

<div class="qr">

<img src="${qr}">

</div>

</div>

<div class="reference">

<div>

<b>Reference No.</b><br>

${referenceNo}

</div>

<div>

<b>Issue Date</b><br>

${issueDate}

</div>

<div>

<b>Expiry Date</b><br>

${expiryDate}

</div>

</div>

<div class="title">

APPLICATION APPROVAL LETTER

</div>

<div class="subtitle">

Official Travel & Visa Consultancy Approval

</div>

<div class="badge">

✔ VERIFIED • AUTHORIZED • REGISTERED

</div>
<p>

Dear <strong>${selectedApplication.fullName}</strong>,

</p>

<p>

We are pleased to officially inform you that your application has been
<strong>approved</strong> by
<strong>${COMPANY.name}</strong> after a comprehensive review of the
information and supporting documents you submitted.

</p>

<p>

This Approval Letter confirms that your application has been accepted
for professional travel and visa consultancy services and has been
officially registered under the reference number and permit ID shown
in this document.

</p>

<p>

To proceed with your application, you are requested to complete the
required initial payment according to the agreed consultancy terms.
Once payment confirmation is received, our professional team will begin
processing your case immediately.

</p>

<p>

Our services include document verification, application preparation,
appointment guidance, submission assistance, continuous follow-up,
professional consultation, and customer support throughout the agreed
service period.

</p>

<p>

Please note that this Approval Letter confirms acceptance into our
consultancy program only. The final decision regarding visa issuance
remains solely with the respective Embassy, Consulate, Immigration
Authority, or Government Institution of the destination country.

</p>

<p>

Thank you for choosing
<strong>${COMPANY.name}</strong>.
We appreciate your trust and look forward to serving you with
professionalism, integrity, confidentiality, and excellence.

</p>

<h2 style="
margin-top:40px;
margin-bottom:15px;
color:#0b4f8a;
">

Applicant Information

</h2>

<table style="
width:100%;
border-collapse:collapse;
font-size:15px;
">

<tr>

<td style="border:1px solid #ddd;padding:12px;">
<strong>Applicant Name</strong>
</td>

<td style="border:1px solid #ddd;padding:12px;">
${selectedApplication.fullName}
</td>

</tr>

<tr>

<td style="border:1px solid #ddd;padding:12px;">
<strong>Passport Number</strong>
</td>

<td style="border:1px solid #ddd;padding:12px;">
${selectedApplication.passport}
</td>

</tr>

<tr>

<td style="border:1px solid #ddd;padding:12px;">
<strong>Destination Country</strong>
</td>

<td style="border:1px solid #ddd;padding:12px;">
${selectedApplication.country}
</td>

</tr>

<tr>

<td style="border:1px solid #ddd;padding:12px;">
<strong>Permit ID</strong>
</td>

<td style="border:1px solid #ddd;padding:12px;">
${permitId}
</td>

</tr>

<tr>

<td style="border:1px solid #ddd;padding:12px;">
<strong>Application Status</strong>
</td>

<td style="border:1px solid #ddd;padding:12px;color:#198754;font-weight:bold;">
APPROVED
</td>

</tr>

</table>

<div style="
text-align:center;
margin-top:40px;
">

<img
src="${qr}"
style="
width:180px;
height:180px;
">

<p style="
margin-top:15px;
font-size:14px;
">

<b>Scan this QR Code to verify the authenticity of this Approval Letter.</b>

</p>

</div>

<div class="content">
<h2 style="
margin-top:45px;
color:#0b4f8a;
">

Official Authorization

</h2>

<div style="
display:flex;
justify-content:space-between;
align-items:flex-end;
margin-top:60px;
">

<!-- Signature -->

<div style="
text-align:center;
width:45%;
">

<img
src="${COMPANY.signature}"
style="
width:220px;
height:auto;
">

<hr style="
margin-top:10px;
border:1px solid #333;
">

<b>Authorized Signature</b><br>

${COMPANY.name}

</div>


<!-- Seal -->

<div style="
text-align:center;
width:45%;
">

<img
src="${COMPANY.seal}"
style="
width:150px;
height:150px;
">

<hr style="
margin-top:10px;
border:1px solid #333;
">

<b>Official Company Seal</b>

</div>

</div>


<h2 style="
margin-top:50px;
color:#0b4f8a;
">

Important Notice

</h2>

<p>

This document is an officially generated Approval Letter issued by
<strong>${COMPANY.name}</strong>.

Any unauthorized alteration, duplication, or misuse of this document
may render it invalid.

Its authenticity can be verified using the QR Code or the Permit ID
displayed above.

</p>


<div style="
margin-top:60px;
padding-top:20px;
border-top:2px solid #0b4f8a;
text-align:center;
font-size:13px;
color:#666;
">

<strong>${COMPANY.name}</strong><br>

${COMPANY.slogan}<br><br>

📧 ${COMPANY.email}<br>

☎ ${COMPANY.phone}<br>

🌐 ${COMPANY.website}<br>

📍 ${COMPANY.address}<br><br>

© ${new Date().getFullYear()} ${COMPANY.name}. All Rights Reserved.

</div>

</div>

<script>

window.onload = () => {

    window.print();

};

</script>

</body>

</html>

`);

letterWindow.document.close();

return;
letterWindow.document.close();

return;

} // END LETTER

}); // END DOCUMENT CLICK EVENT
// ===========================================================
// CLOSE DETAILS MODAL
// ===========================================================

closeModal.addEventListener("click", () => {
    detailsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === detailsModal) {
        detailsModal.style.display = "none";
    }
});

// ===========================================================
// LOGOUT
// ===========================================================

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

// ===========================================================
// END OF FILE
// GUZO GO INTERNATIONAL
// PROFESSIONAL ADMIN DASHBOARD 2026
// ===========================================================
