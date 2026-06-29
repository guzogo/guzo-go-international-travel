import { getApplications } from "./firebase.js";

const table = document.getElementById("applicationsTable");

const totalApps = document.getElementById("totalApps");
const approvedApps = document.getElementById("approvedApps");
const pendingApps = document.getElementById("pendingApps");
const rejectedApps = document.getElementById("rejectedApps");

async function loadApplications(){

const applications = await getApplications();

table.innerHTML = "";

let approved = 0;
let pending = 0;
let rejected = 0;

applications.forEach(app=>{

if(app.status==="Approved") approved++;

if(app.status==="Pending") pending++;

if(app.status==="Rejected") rejected++;

table.innerHTML += `

<tr>

<td>${app.applicantId}</td>

<td>${app.fullName}</td>

<td>${app.country}</td>

<td>${app.status}</td>

<td>

<button class="approve">
Approve
</button>

<button class="reject">
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

loadApplications();
