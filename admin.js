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

<h1 style="text-align:center;color:#0b4f8a;margin-bottom:5px;">
Guzo Go International Travel & Visa Consultancy
</h1>

<p style="text-align:center;font-size:15px;color:#666;">
Professional Travel & Visa Consultancy
</p>

<hr style="margin:20px 0;">

<h2 style="text-align:center;color:#1b5e20;">
APPLICATION ACCEPTANCE LETTER
</h2>

<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Applicant ID:</strong> ${applicant.applicantId}</p>

<hr>

<p>
Dear <strong>${applicant.fullName}</strong>,
</p>

<p>
We are pleased to inform you that your application has been officially
received and accepted for processing by
<strong>Guzo Go International Travel & Visa Consultancy</strong>.
</p>

<p>
Following our initial review, your application has qualified to proceed
to the next stage of processing. Our professional team will guide and
coordinate your application throughout the remaining procedures.
</p>

<h3>Processing Arrangement</h3>

<p>
To begin the processing, the applicant is required to pay
<strong>25%</strong> of the total agreed service fee.
The remaining <strong>75%</strong> of the service fee will be managed
according to the agreed processing schedule between the applicant and
Guzo Go International Travel & Visa Consultancy.
</p>

<h3>Applicant Responsibilities</h3>

<ul>
<li>Provide complete and accurate documents.</li>
<li>Follow all instructions from our processing team.</li>
<li>Respond promptly to additional document requests.</li>
<li>Maintain valid passport and contact information.</li>
</ul>

<p>
<strong>Important Notice:</strong><br>
This letter confirms only that your application has been accepted for
processing by Guzo Go International Travel & Visa Consultancy.
Any visa or immigration decision remains solely under the authority of
the relevant Embassy or Government Immigration Department.
</p>

<br>

<table style="width:100%;border-collapse:collapse;">
<tr><td><b>Applicant Name</b></td><td>${applicant.fullName}</td></tr>
<tr><td><b>Passport No.</b></td><td>${applicant.passport}</td></tr>
<tr><td><b>Destination</b></td><td>${applicant.country}</td></tr>
<tr><td><b>Status</b></td><td>${applicant.status}</td></tr>
</table>

<br><br>

<p>
Thank you for choosing
<b>Guzo Go International Travel & Visa Consultancy.</b>
We appreciate your trust and look forward to serving you professionally.
</p>

<br><br>

<p><b>Authorized Officer</b></p>

<p>Guzo Go International Travel & Visa Consultancy</p>
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

letterWindow.document.close();

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
