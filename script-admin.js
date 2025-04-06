// script-admin.js – Dashboard client avec infos de contact + horaires

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// 🔧 Config Firebase
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

// 🧩 Inputs des infos de contact
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const adresseInput = document.getElementById("adresse");
const codePostalInput = document.getElementById("codePostal");
const lieuInput = document.getElementById("lieu");
const saveBtn = document.getElementById("save");
const message = document.getElementById("message");

// 🔐 Authentification
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const uid = user.uid;

  try {
    // Récupération du profil utilisateur
    const profilRef = doc(db, "users", uid);
    const profilSnap = await getDoc(profilRef);

    if (profilSnap.exists()) {
      // Préremplissage
      await preRemplirFormulaire(uid);
      await preRemplirHoraires(uid);

      // Sauvegardes
      activerSauvegarde(uid);
      activerSauvegardeHoraires(uid);
    }
  } catch (error) {
    console.error("❌ Erreur chargement profil :", error);
  }
});

// 📥 Pré-remplissage des infos de contact
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
  } catch (err) {
    console.error("❌ Erreur chargement infos :", err);
  }
}

// 💾 Sauvegarde des infos de contact
function activerSauvegarde(uid) {
  if (!saveBtn) return;

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

      message.textContent = "✅ Infos mises à jour";
      message.style.color = "green";
    } catch (error) {
      console.error("❌ Erreur Firestore :", error);
      message.textContent = "❌ Erreur de mise à jour";
      message.style.color = "red";
    }

    setTimeout(() => {
      message.textContent = "";
    }, 3000);
  });
}

// 📥 Pré-remplissage des horaires
async function preRemplirHoraires(uid) {
  const jours = [
    "lundi", "mardi", "mercredi", "jeudi",
    "vendredi", "samedi", "dimanche"
  ];

  try {
    const docRef = doc(db, "horaires", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      jours.forEach(jour => {
        const input = document.getElementById(`horaire-${jour}`);
        if (input) input.value = data[jour] ?? "";
      });
    }
  } catch (error) {
    console.error("❌ Erreur chargement horaires :", error);
  }
}

// 💾 Sauvegarde des horaires
function activerSauvegardeHoraires(uid) {
  const jours = [
    "lundi", "mardi", "mercredi", "jeudi",
    "vendredi", "samedi", "dimanche"
  ];

  const saveBtn = document.getElementById("save-horaires");
  const message = document.getElementById("message-horaires");

  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    const horaires = {};

    jours.forEach(jour => {
      const input = document.getElementById(`horaire-${jour}`);
      horaires[jour] = input?.value ?? "";
    });

    try {
      await setDoc(doc(db, "horaires", uid), horaires);
      message.textContent = "✅ Horaires enregistrés avec succès";
      message.style.color = "green";
    } catch (error) {
      console.error("❌ Erreur sauvegarde horaires :", error);
      message.textContent = "❌ Erreur lors de l'enregistrement";
      message.style.color = "red";
    }

    setTimeout(() => {
      message.textContent = "";
    }, 3000);
  });
}
