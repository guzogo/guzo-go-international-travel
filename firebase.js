// ===============================
// Guzo Go International Travel
// Firebase Configuration
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
getFirestore
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
getStorage
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

const firebaseConfig = {

apiKey: "AIzaSyBX7MKewr34ciRectfXDJnoZEgF6h-uC3I",

authDomain: "guzo-go-international-travel.firebaseapp.com",

projectId: "guzo-go-international-travel",

storageBucket: "guzo-go-international-travel.firebasestorage.app",

messagingSenderId: "157450888511",

appId: "1:157450888511:web:347bd99e9e97422e0a9f8a"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);

export { db, storage };
