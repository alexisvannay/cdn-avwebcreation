// script-admin.js - Dashboard multi-comptes sécurisé

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// 🔧 Configuration Firebase
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
const auth = getAuth(app);

// 🎯 Ciblage des champs
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const adresseInput = document.getElementById("adresse");
const codePostalInput = document.getElementById("codePostal");
const lieuInput = document.getElementById("lieu");
const saveBtn = document.getElementById("save");
const message = document.getElementById("message");

// 🔁 Pré-remplissage des champs
async function preRemplirFormulaire(uid) {
  try {
    const docRef = doc(db, "infos", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (emailInput) emailInput.value = data.email ?? "";
      if (phoneInput) phoneInput.value = data.phone ?? "";
      if (adresseInput) adresseInput.value = data.adresse ?? "";
      if (codePostalInput) codePostalInput.value = data.codePostal ?? "";
      if (lieuInput) lieuInput.value = data.lieu ?? "";
    }
  } catch (error) {
    console.error("Erreur lors du pré-remplissage :", error);
  }
}

// 💾 Enregistrement des données
function activerSauvegarde(uid) {
  if (saveBtn) {
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
}

// 🔐 Récupérer l'utilisateur connecté
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    preRemplirFormulaire(uid);
    activerSauvegarde(uid);
  } else {
    console.warn("Utilisateur non connecté.");
    // Optionnel : rediriger vers la page de login
    // window.location.href = "index.html";
  }
});
