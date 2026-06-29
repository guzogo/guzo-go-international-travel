// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
getDocs,
doc,
getDoc,
updateDoc,
query,
where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {

apiKey: "AIzaSyBX7MKewr34ciRectfXDJnoZEgF6h-uC3I",

authDomain: "guzo-go-international-travel.firebaseapp.com",

projectId: "guzo-go-international-travel",

storageBucket: "guzo-go-international-travel.firebasestorage.app",

messagingSenderId: "157450888511",

appId: "1:157450888511:web:347bd99e9e97422e0a9f8a",

measurementId: "G-HV909YLHHM"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };


// Generate Applicant ID

export function generateApplicantId(){

const number = Date.now().toString().slice(-6);

return "GG-" + number;

}
// ===============================
// Save Application to Firestore
// ===============================

export async function saveApplication(data){

try{

const applicantId = generateApplicantId();

const application = {

applicantId: applicantId,

fullName: data.fullName,

phone: data.phone,

email: data.email,

passport: data.passport,

country: data.country,

status: "Pending",

createdAt: new Date().toISOString()

};

await addDoc(collection(db,"applications"), application);

return {

success:true,

applicantId: applicantId

};

}catch(error){

console.error(error);

return{

success:false,

message:error.message

};

}

}
// ===============================
// Find Application by Applicant ID
// ===============================

export async function findApplication(applicantId){

try{

const q = query(
collection(db,"applications"),
where("applicantId","==",applicantId)
);

const snapshot = await getDocs(q);

if(snapshot.empty){

return null;

}

return snapshot.docs[0].data();

}catch(error){

console.error(error);

return null;

}

}


// ===============================
// Get All Applications
// ===============================

export async function getApplications(){

try{

const snapshot = await getDocs(
collection(db,"applications")
);

const applications = [];

snapshot.forEach((doc)=>{

applications.push({

id:doc.id,

...doc.data()

});

});

return applications;

}catch(error){

console.error(error);

return [];

}

}
