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
// GUZO GO INTERNATIONAL
// PROFESSIONAL ADMIN DASHBOARD v4.0
// =======================================


// ===============================
// HTML ELEMENTS
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
// COMPANY INFORMATION
// ===============================

const COMPANY = {

    name: "Guzo Go International Travel & Visa Consultancy",

    email: "guzogointernational@gmail.com",

    phone: "+251942188994",

    website: "https://guzogo.github.io/guzo-go-international-travel/",

    logo: "IMG_20260724_195618_814.jpg"

};


// ===============================
// OFFICIAL SIGNATURE
// ===============================

const SIGNATURE =
"https://raw.githubusercontent.com/guzogo/guzo-go-international-travel/main/file_00000000867481f4816ec6f35e1d4c8c.png";


// ===============================
// OFFICIAL SEAL
// ===============================

const SEAL =
"https://raw.githubusercontent.com/guzogo/guzo-go-international-travel/main/file_00000000ebcc81f48c8b3617bf707cbc.png";


// ===============================
// GLOBAL VARIABLES
// ===============================

let allApplications = [];


// ===============================
// AUTHENTICATION
// ===============================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "admin-login.html";

        return;

    }

    loadApplications();

});
// =======================================
// LOAD APPLICATIONS
// =======================================

async function loadApplications() {

    try {

        allApplications = await getApplications();

        displayApplications(allApplications);

    } catch (error) {

        console.error("Load Error:", error);

        alert("Failed to load applications.");

    }

}


// =======================================
// DISPLAY APPLICATIONS
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
background:${
app.status==="Approved"
? "#28a745"
: app.status==="Rejected"
? "#dc3545"
: "#ffc107"
};
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
// SEARCH APPLICATIONS
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
// BUTTON ACTIONS
// =======================================

document.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    const applicant = allApplications.find(app => app.id === id);

    if (!applicant) return;

    // ===================================
    // COUNTRY PREFIX
    // ===================================

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

        default:
            prefix = "GV";

    }

    const permitId = `${prefix}-${applicant.applicantId}`;

    const verifyUrl =
`https://guzogo.github.io/guzo-go-international-travel/verify.html?id=${permitId}`;

    const qr = await QRCode.toDataURL(verifyUrl);

    // ===================================
    // VIEW APPLICANT
    // ===================================

    if (e.target.classList.contains("view")) {

        detailsContent.innerHTML = `
<div style="font-family:Arial,sans-serif;padding:20px;">

<div style="text-align:center;">

<img src="${COMPANY.logo}"
style="width:80px;height:80px;object-fit:contain;">

<h2 style="color:#0b4f8a;">
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

<tr><td><b>Applicant ID</b></td><td>${applicant.applicantId}</td></tr>

<tr><td><b>Full Name</b></td><td>${applicant.fullName}</td></tr>

<tr><td><b>Passport</b></td><td>${applicant.passport}</td></tr>

<tr><td><b>Country</b></td><td>${applicant.country}</td></tr>

<tr><td><b>Email</b></td><td>${applicant.email}</td></tr>

<tr><td><b>Phone</b></td><td>${applicant.phone}</td></tr>

<tr><td><b>Date of Birth</b></td><td>${applicant.dob}</td></tr>

<tr><td><b>Gender</b></td><td>${applicant.gender}</td></tr>

<tr><td><b>Occupation</b></td><td>${applicant.occupation}</td></tr>

<tr><td><b>Address</b></td><td>${applicant.address}</td></tr>

<tr><td><b>Permit ID</b></td><td>${permitId}</td></tr>

<tr>

<td><b>Status</b></td>

<td>

<span style="padding:6px 12px;border-radius:20px;color:white;background:${
applicant.status==="Approved" ? "#28a745" :
applicant.status==="Rejected" ? "#dc3545" :
"#ffc107"
};">

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
        // =======================================
    // APPROVE APPLICATION
    // =======================================

    if (e.target.classList.contains("approve")) {

        const success = await updateApplicationStatus(id, "Approved");

        if (success) {

            alert("Application Approved Successfully");

            loadApplications();

        }

        return;

    }


    // =======================================
    // REJECT APPLICATION
    // =======================================

    if (e.target.classList.contains("reject")) {

        const success = await updateApplicationStatus(id, "Rejected");

        if (success) {

            alert("Application Rejected Successfully");

            loadApplications();

        }

        return;

  }
    
// =======================================
// APPROVAL LETTER (ENTERPRISE VERSION)
// =======================================

if (e.target.classList.contains("letter")) {

    if (applicant.status !== "Approved") {

        alert("Please approve the application before generating the Acceptance Letter.");

        return;

    }

    const referenceNo =
        "GGI-" +
        new Date().getFullYear() +
        "-" +
        applicant.applicantId;

    const issueDate = new Date().toLocaleDateString();

    const expiryDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toLocaleDateString();

    const letterWindow = window.open("", "_blank");

    letterWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<title>Official Acceptance Letter</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{

font-family:Arial,Helvetica,sans-serif;
background:#fff;
color:#222;
padding:45px;
line-height:1.8;

}

.page{

max-width:900px;
margin:auto;
background:#fff;
position:relative;

}

.top-bar{

height:10px;
background:#0b4f8a;
margin-bottom:20px;

}

.header{

display:flex;
align-items:center;
border-bottom:3px solid #0b4f8a;
padding-bottom:20px;

}

.logo{

width:90px;
height:90px;
object-fit:contain;
margin-right:20px;

}

.company{

flex:1;

}

.company h1{

font-size:28px;
color:#0b4f8a;
margin-bottom:5px;

}

.company p{

font-size:14px;
color:#666;

}

.reference{

margin-top:25px;
display:flex;
justify-content:space-between;
font-size:14px;

}

.title{

text-align:center;
margin-top:35px;
font-size:34px;
font-weight:bold;
color:#145a32;
letter-spacing:1px;

}

.subtitle{

text-align:center;
margin-top:8px;
font-size:15px;
color:#666;

}

.badge{

width:270px;
margin:25px auto;
background:#198754;
color:#fff;
padding:12px;
text-align:center;
font-weight:bold;
border-radius:30px;

}

.watermark{

position:fixed;
top:40%;
left:12%;
font-size:95px;
font-weight:bold;
color:rgba(0,0,0,.04);
transform:rotate(-28deg);
pointer-events:none;
z-index:-1;

}

.content{

margin-top:30px;
font-size:16px;
text-align:justify;

}

.content p{

margin-bottom:18px;

}

.info-table{

width:100%;
border-collapse:collapse;
margin-top:30px;

}

.info-table td{

border:1px solid #dcdcdc;
padding:12px;

}

.section-title{

margin-top:35px;
font-size:20px;
font-weight:bold;
color:#0b4f8a;

}
.footer{

margin-top:50px;
border-top:2px solid #0b4f8a;
padding-top:20px;
text-align:center;
font-size:13px;
color:#666;

}

</style>

</head>

<body>

<div class="watermark">

GUZO GO INTERNATIONAL

</div>

<div class="page">

<div class="top-bar"></div>

<div class="header">

<img src="${COMPANY.logo}" class="logo">

<div class="company">

<h1>${COMPANY.name}</h1>

<p>📧 ${COMPANY.email}</p>

<p>☎ ${COMPANY.phone}</p>

<p>🌐 ${COMPANY.website}</p>

</div>

</div>

<div class="reference">

<div>

<b>Reference No:</b> ${referenceNo}

</div>

<div>

<b>Issue Date:</b> ${issueDate}

</div>

<div>

<b>Valid Until:</b> ${expiryDate}

</div>

</div>

<div class="title">

APPLICATION ACCEPTANCE LETTER

</div>

<div class="subtitle">

Official Visa Consultancy & Processing Confirmation

</div>

<div class="badge">

✔ VERIFIED • AUTHORIZED • REGISTERED

</div>

<div class="content">
<p>

Dear <strong>${applicant.fullName}</strong>,

</p>

<p>

We are pleased to officially inform you that, after a comprehensive assessment of your submitted application and supporting documentation, your application has been <strong>successfully accepted</strong> by <strong>${COMPANY.name}</strong> for professional travel and visa consultancy services.

</p>

<p>

This Acceptance Letter serves as an official confirmation that your application has passed our preliminary evaluation and has been formally registered in our processing system under the reference and permit number shown in this document.

</p>

<p>

To commence the agreed consultancy service, the applicant is required to complete the initial payment of <strong>25%</strong> of the agreed professional service fee. The remaining balance shall be settled according to the agreed payment schedule between the applicant and the company.

</p>

<p>

Upon confirmation of the initial payment, <strong>${COMPANY.name}</strong> will professionally manage and coordinate your visa processing procedure. Our consultancy team will supervise document verification, application preparation, appointment scheduling where applicable, submission guidance, continuous follow-up, and professional consultation throughout the entire agreed service period.

</p>

<p>

Our company is committed to providing services with the highest standards of professionalism, transparency, confidentiality, integrity, and customer care. Every stage of your application will be handled with due diligence until our consultancy responsibilities have been completed.

</p>

<p>

Please note that this Acceptance Letter confirms only your acceptance into our professional consultancy and processing program. The final authority regarding visa approval or refusal remains exclusively with the respective Embassy, Consulate, Immigration Authority, or Government Institution of the destination country.

</p>

<p>

We sincerely appreciate your confidence in <strong>${COMPANY.name}</strong> and look forward to assisting you throughout your travel and immigration journey with professional, reliable, and efficient consultancy services.

</p>

<div class="section-title">

Applicant Information

</div>

<table class="info-table">

<tr>

<td><strong>Applicant Name</strong></td>

<td>${applicant.fullName}</td>

</tr>

<tr>

<td><strong>Passport Number</strong></td>

<td>${applicant.passport}</td>

</tr>

<tr>

<td><strong>Destination Country</strong></td>

<td>${applicant.country}</td>

</tr>

<tr>

<td><strong>Application Status</strong></td>

<td>${applicant.status}</td>

</tr>

<tr>

<td><strong>Permit ID</strong></td>

<td>${permitId}</td>

</tr>

</table>
<div style="text-align:center;margin-top:40px;">

<img src="${qr}" width="180">

<p style="margin-top:12px;font-size:14px;">

<b>Scan this QR Code to verify the authenticity of this Acceptance Letter.</b>

</p>

</div>

<div class="section-title">

Official Authorization

</div>

<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:50px;">

<div style="position:relative;display:inline-block;">

<img
src="${SIGNATURE}"
style="width:230px;display:block;">

<img
src="${SEAL}"
style="
position:absolute;
left:120px;
top:20px;
width:110px;
opacity:0.95;
">

<div style="margin-top:20px;">

<b>Authorized Officer</b><br>

${COMPANY.name}

</div>

</div>

<div style="text-align:right;font-size:13px;color:#666;">

<p><b>Document Status:</b> VERIFIED</p>

<p><b>Reference:</b> ${referenceNo}</p>

<p><b>Permit ID:</b> ${permitId}</p>

</div>

</div>

<div class="section-title">

Important Notice

</div>

<p>

This document is an official Acceptance Letter issued by
<strong>${COMPANY.name}</strong>.
Any alteration, duplication, or unauthorized modification of this
document may render it invalid. Authenticity can be verified using
the QR Code or the Permit ID provided above.

</p>

<div class="footer">

<strong>${COMPANY.name}</strong><br>

Professional Travel & Visa Consultancy<br>

📧 ${COMPANY.email}<br>

☎ ${COMPANY.phone}<br>

🌐 ${COMPANY.website}<br><br>

© 2026 ${COMPANY.name}. All Rights Reserved.

</div>

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

    // =======================================
    // DELETE APPLICATION
    // =======================================

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
// CLOSE DETAILS MODAL
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
// LOGOUT
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
// END OF FILE
// Guzo Go International Admin Dashboard
// Professional Version 2026
// =======================================    
