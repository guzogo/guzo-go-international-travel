import { auth } from "./firebase.js";

import {
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const email = document.getElementById("email");

const password = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");

const error = document.getElementById("error");
loginBtn.addEventListener("click", async ()=>{

const userEmail = email.value.trim();

const userPassword = password.value.trim();

error.innerHTML = "";

if(userEmail==="" || userPassword===""){

error.innerHTML="❌ Please enter Email and Password.";

return;

}

try{

await signInWithEmailAndPassword(
auth,
userEmail,
userPassword
);

window.location.href="admin.html";

}catch(err){

error.innerHTML="❌ Invalid Email or Password.";

console.error(err);
alert(err.code + "\n" + err.message);

}

});
