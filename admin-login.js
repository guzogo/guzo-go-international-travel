import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
getAuth,
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {

apiKey: "AIzaSyBX7MKewr34ciRectfXDJnoZEgF6h-uC3I",

authDomain: "guzo-go-international-travel.firebaseapp.com",

projectId: "guzo-go-international-travel",

storageBucket: "guzo-go-international-travel.firebasestorage.app",

messagingSenderId: "157450888511",

appId: "1:157450888511:web:347bd99e9e97422e0a9f8a"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", async ()=>{

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const error = document.getElementById("error");

try{

await signInWithEmailAndPassword(auth,email,password);

window.location.href = "admin.html";

}catch(err){

error.innerHTML = "❌ Invalid Email or Password";

}

});
