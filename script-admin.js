// script-admin.js - Script centralisé pour tableau de bord client

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// 🔧 Configuration Firebase centrale (à jour)
const firebaseConfig = {
  apiKey: "AIzaSyBRIdIXj0IixLwASOgZsqka550gOAVr7_4",
  authDomain: "avwebcreation-admin.firebaseapp.com",
  projectId: "avwebcreation-admin",
  storageBucket: "avwebcreation-admin.firebasestorage.app",
  messagingSenderId: "293089525298",
  appId: "1:293089525298:web:68ff4408a175909699862b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔍 Lire l'UID du client depuis une balise <meta name="client-uid" content="...">
const uid = document.querySelector('meta[name="client-uid"]')?.content;

if (!uid) {
  console.error("❌ UID du client manquant dans <meta name='client-uid'>");
}

// 🎯 Ciblage des champs
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const adresseInput = document.getElementById("adresse");
const codePostalInput = document.getElementById("codePostal");
const lieuInput = document.getElementById("lieu");
const saveBtn = document.getElementById("save");
const message = document.getElementById("message");

// 💾 Mise à jour des infos dans Firestore
if (saveBtn && uid) {
  saveBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const phone = phoneInput.value;
    const adresse = adresseInput.value;
    const codePostal = codePostalInput.value;
    const lieu = lieuInput.value;

    try {
      await setDoc(doc(db, "infos", uid), {
        email,
        phone,
        adresse,
        codePostal,
        lieu
      });

      message.textContent = "✅ Informations enregistrées";
      message.style.color = "green";
    } catch (error) {
      console.error("❌ Erreur Firestore :", error);
      message.textContent = "❌ Erreur lors de l'enregistrement";
      message.style.color = "red";
    }

    setTimeout(() => {
      message.textContent = "";
    }, 3000);
  });
}