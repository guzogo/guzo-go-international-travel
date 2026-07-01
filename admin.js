import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm";

import {
    auth,
    getApplications,
    updateApplicationStatus
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
case "Qatar":
    prefix = "QA";
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

        }

        const permitId = `${prefix}-${applicant.applicantId}`;

        // QR Code

        const verifyUrl =
        `https://guzogo.github.io/guzo-go-international-travel/verify.html?id=${permitId}`;

        const qr = await QRCode.toDataURL(verifyUrl);

        detailsContent.innerHTML = `

<h2 style="margin-bottom:20px;">Applicant Details</h2>

<p><strong>Applicant ID:</strong> ${applicant.applicantId}</p>

<p><strong>Permit ID:</strong> ${permitId}</p>

<hr>

<p><strong>Full Name:</strong> ${applicant.fullName}</p>

<p><strong>Email:</strong> ${applicant.email}</p>

<p><strong>Phone:</strong> ${applicant.phone}</p>

<p><strong>Passport Number:</strong> ${applicant.passport}</p>

<p><strong>Country:</strong> ${applicant.country}</p>

<p><strong>Date of Birth:</strong> ${applicant.dob}</p>

<p><strong>Gender:</strong> ${applicant.gender}</p>

<p><strong>Occupation:</strong> ${applicant.occupation}</p>

<p><strong>Address:</strong> ${applicant.address}</p>

<p><strong>Service:</strong> ${applicant.service}</p>

<p><strong>Passport Type:</strong> ${applicant.passportOption || "-"}</p>

<p><strong>Payment Reference:</strong> ${applicant.reference}</p>

<p><strong>Amount:</strong> ${applicant.amount}</p>

<p><strong>Notes:</strong> ${applicant.notes || "-"}</p>

<p><strong>Status:</strong> ${applicant.status}</p>

<div style="text-align:center;margin-top:25px;">

<img src="${qr}" width="180">

<br><br>

<small>Scan to Verify Permit</small>

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
<html>
<head>
<title>Approval Letter</title>
<style>
body{
font-family:Arial,sans-serif;
padding:40px;
line-height:1.8;
}
h1{
color:#0b4f8a;
text-align:center;
}
.approved{
color:green;
font-size:24px;
font-weight:bold;
text-align:center;
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

<h1>Guzo Go International Travel & Visa Consultancy</h1>

<p class="approved">APPLICATION APPROVAL LETTER</p>

<p>Dear <b>${applicant.fullName}</b>,</p>

<p>
We are pleased to inform you that your application submitted through
<b>Guzo Go International Travel & Visa Consultancy</b> has been carefully
reviewed and has been <b>approved</b>.
</p>

<p>
This approval confirms that your application has successfully completed
our initial verification process. Please keep this letter as part of
your application records. You may be contacted for additional
documentation, interview scheduling, medical examination, embassy
appointment, or other procedures depending on the destination country's
requirements.
</p>

<p>
Please note that this approval letter does not replace an official visa,
work permit, or residence permit issued by the destination country's
government. Final approval remains subject to the relevant immigration
authority.
</p>

<p>
Thank you for choosing <b>Guzo Go International Travel & Visa Consultancy</b>.
We appreciate your trust and wish you success in your international
travel journey.
</p>

<table>

<tr><td>Applicant ID</td><td>${applicant.applicantId}</td></tr>

<tr><td>Passport</td><td>${applicant.passport}</td></tr>

<tr><td>Country</td><td>${applicant.country}</td></tr>

<tr><td>Status</td><td>${applicant.status}</td></tr>

<tr><td>Date</td><td>${new Date().toLocaleDateString()}</td></tr>

</table>

<br><br>

<p>
Please keep this approval letter for your records.
</p>

<br><br>

<p><b>Authorized By</b></p>

<p>Guzo Go International Travel & Visa Consultancy</p>

<script>
window.print();
</script>

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
