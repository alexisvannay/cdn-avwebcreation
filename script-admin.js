// script-admin.js - Dashboard client personnalisé (multi-abonnement)

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

// 🧩 Ciblage des champs
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const adresseInput = document.getElementById("adresse");
const codePostalInput = document.getElementById("codePostal");
const lieuInput = document.getElementById("lieu");
const saveBtn = document.getElementById("save");
const message = document.getElementById("message");

// 🧠 Pré-remplir les champs depuis Firestore
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

// 💾 Sauvegarder les modifications
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

        message.textContent = "✅ Infos enregistrées";
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
}

// 🔐 Authentification + chargement des droits
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("Non connecté");
    return;
  }

  const uid = user.uid;

  try {
    const profilRef = doc(db, "users", uid);
    const profilSnap = await getDoc(profilRef);

    if (profilSnap.exists()) {
      const userData = profilSnap.data();
      const type = userData.typeClient ?? "basic";

      // Affichage dynamique des sections
      if (type === "basic") {
        document.getElementById("formulaire-contact")?.style.setProperty("display", "block");
      } else if (type === "galerie") {
        document.getElementById("formulaire-contact")?.style.setProperty("display", "block");
        document.getElementById("formulaire-galerie")?.style.setProperty("display", "block");
      } else if (type === "admin") {
        document.querySelectorAll(".admin-section").forEach(el => el.style.setProperty("display", "block"));
      } else {
        document.getElementById("section-non-autorisee")?.style.setProperty("display", "block");
      }

      // Badge affiché sur le dashboard
      const badge = document.getElementById("type-client-badge");
      if (badge) badge.textContent = `Abonnement : ${type}`;
    }

    // Chargement et édition
    preRemplirFormulaire(uid);
    activerSauvegarde(uid);

  } catch (error) {
    console.error("❌ Erreur chargement du profil :", error);
  }
});
