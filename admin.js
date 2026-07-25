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
// APPROVAL LETTER (PROFESSIONAL v5.0)
// =======================================

if (e.target.classList.contains("letter")) {

    if (applicant.status !== "Approved") {

        alert("Please approve the application before generating the Acceptance Letter.");

        return;

    }

    const referenceNo =
        `GGI-${new Date().getFullYear()}-${applicant.applicantId}`;

    const issueDate = new Date().toLocaleDateString();

    const expiryDate = new Date(
        Date.now() + (30 * 24 * 60 * 60 * 1000)
    ).toLocaleDateString();

    const letterWindow = window.open(
        "",
        "_blank",
        "width=1000,height=900"
    );

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

font-family:"Times New Roman",serif;
background:#ececec;
padding:40px;

}

.page{

width:210mm;
min-height:297mm;
margin:auto;
background:#fff;
padding:40px 45px;
position:relative;
box-shadow:0 0 20px rgba(0,0,0,.15);

}

.top-line{

height:8px;
background:#0b4f8a;
margin:-40px -45px 30px;

}

.header{

display:flex;
align-items:center;
justify-content:space-between;
border-bottom:3px solid #0b4f8a;
padding-bottom:20px;

}

.logo{

width:90px;
height:90px;
object-fit:contain;

}

.company{

flex:1;
padding-left:20px;

}

.company h1{

font-size:28px;
color:#0b4f8a;
margin-bottom:8px;

}

.company p{

font-size:14px;
color:#555;
margin:3px 0;

}

.reference{

text-align:right;
font-size:13px;
line-height:1.8;

}

.title{

margin-top:35px;
text-align:center;
font-size:32px;
font-weight:bold;
color:#145a32;
letter-spacing:1px;

}

.subtitle{

margin-top:8px;
text-align:center;
font-size:15px;
color:#666;

}

.badge{

width:300px;
margin:25px auto;
padding:12px;
background:#198754;
color:#fff;
font-weight:bold;
border-radius:40px;
text-align:center;

}

.watermark{

position:absolute;
top:45%;
left:50%;
transform:translate(-50%,-50%) rotate(-30deg);
font-size:90px;
font-weight:bold;
color:rgba(0,0,0,.04);
white-space:nowrap;
pointer-events:none;

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
    
.info-box{

margin-top:30px;
border:2px solid #0b4f8a;
border-radius:8px;
overflow:hidden;

}

.info-title{

background:#0b4f8a;
color:#fff;
padding:12px;
font-size:18px;
font-weight:bold;

}

.info-table{

width:100%;
border-collapse:collapse;

}

.info-table td{

padding:12px 15px;
border:1px solid #d9d9d9;
font-size:15px;

}

.info-table td:first-child{

font-weight:bold;
background:#f8f9fa;
width:35%;

}

.verify-box{

margin-top:35px;
border:2px dashed #198754;
padding:20px;
text-align:center;
border-radius:10px;
background:#f8fff9;

}

.verify-box img{

width:170px;
margin-bottom:10px;

}

.verify-box p{

font-size:14px;
color:#444;

}

.authorization{

margin-top:50px;
display:flex;
justify-content:space-between;
align-items:flex-end;

}

.signature-area{

position:relative;
width:320px;

}

.signature{

width:220px;
display:block;

}

.seal{

position:absolute;
left:120px;
top:10px;
width:110px;
opacity:.95;

}

.sign-name{

margin-top:18px;
font-weight:bold;
font-size:16px;

}

.document-status{

text-align:right;
font-size:14px;
line-height:2;

}

.footer{

margin-top:60px;
padding-top:20px;
border-top:3px solid #0b4f8a;
text-align:center;
font-size:13px;
color:#666;

}

@media print{

body{

background:#fff;
padding:0;

}

.page{

box-shadow:none;
margin:0;
width:100%;
min-height:auto;

}

}

</style>

</head>

<body>

<div class="page">

<div class="watermark">
GUZO GO INTERNATIONAL
</div>

<div class="top-line"></div>
<div class="header">

    <img src="${COMPANY.logo}" class="logo">

    <div class="company">

        <h1>${COMPANY.name}</h1>

        <p>📧 ${COMPANY.email}</p>

        <p>☎ ${COMPANY.phone}</p>

        <p>🌐 ${COMPANY.website}</p>

    </div>

    <div class="reference">

        <strong>Reference No:</strong><br>
        ${referenceNo}<br><br>

        <strong>Issue Date:</strong><br>
        ${issueDate}<br><br>

        <strong>Valid Until:</strong><br>
        ${expiryDate}

    </div>

</div>

<div class="title">

APPLICATION ACCEPTANCE LETTER

</div>

<div class="subtitle">

Official Confirmation of Professional Visa Consultancy Services

</div>

<div class="badge">

✔ APPROVED • VERIFIED • AUTHORIZED

</div>

<div class="content">

<p>

Dear <strong>${applicant.fullName}</strong>,

</p>

<p>

We are pleased to officially inform you that your application has been
<strong>successfully accepted</strong> by
<strong>${COMPANY.name}</strong> after a comprehensive review of the
documents and information you submitted.

</p>

<p>

This Acceptance Letter confirms that your application has been registered
under our official consultancy system and assigned the unique
<strong>Permit ID</strong> shown below.

</p>

<p>

To begin the consultancy process, the applicant is required to complete
the agreed initial payment according to the service agreement.
After payment confirmation, our consultants will immediately begin the
visa processing and document management procedures.

</p>
<div class="info-box">

<div class="info-title">

Applicant Information

</div>

<table class="info-table">

<tr>

<td>Applicant Name</td>

<td>${applicant.fullName}</td>

</tr>

<tr>

<td>Applicant ID</td>

<td>${applicant.applicantId}</td>

</tr>

<tr>

<td>Passport Number</td>

<td>${applicant.passport}</td>

</tr>

<tr>

<td>Destination Country</td>

<td>${applicant.country}</td>

</tr>

<tr>

<td>Email Address</td>

<td>${applicant.email}</td>

</tr>

<tr>

<td>Phone Number</td>

<td>${applicant.phone}</td>

</tr>

<tr>

<td>Application Status</td>

<td style="color:#198754;font-weight:bold;">

${applicant.status}

</td>

</tr>

<tr>

<td>Permit ID</td>

<td>

<strong>${permitId}</strong>

</td>

</tr>

</table>

</div>

<div class="verify-box">

<img src="${qr}">

<h3 style="color:#198754;margin-bottom:10px;">

Verification QR Code

</h3>

<p>

Scan this QR Code to verify the authenticity of this Acceptance Letter.

</p>

<p style="margin-top:10px;">

Verification URL

</p>

<p style="font-size:13px;color:#666;word-break:break-all;">

${verifyUrl}

</p>

</div>
<div class="authorization">

    <div class="signature-area">

        <img src="${SIGNATURE}" class="signature">

        <img src="${SEAL}" class="seal">

        <div class="sign-name">

            Authorized Officer<br>

            ${COMPANY.name}

        </div>

    </div>

    <div class="document-status">

        <p><strong>Document Status:</strong> VERIFIED</p>

        <p><strong>Reference No:</strong> ${referenceNo}</p>

        <p><strong>Permit ID:</strong> ${permitId}</p>

        <p><strong>Issue Date:</strong> ${issueDate}</p>

    </div>

</div>

<div class="footer">

<strong>${COMPANY.name}</strong><br>

Professional Travel & Visa Consultancy<br><br>

📧 ${COMPANY.email}<br>

☎ ${COMPANY.phone}<br>

🌐 ${COMPANY.website}<br><br>

This Acceptance Letter is electronically generated by
<strong>${COMPANY.name}</strong>.
The authenticity of this document can be verified using the QR Code
or the Permit ID shown above.<br><br>

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
