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

// 🎯 Références des éléments DOM
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const adresseInput = document.getElementById("adresse");
const codePostalInput = document.getElementById("codePostal");
const lieuInput = document.getElementById("lieu");
const saveBtn = document.getElementById("save");
const message = document.getElementById("message");
const saveHorairesBtn = document.getElementById("save-horaires");
const messageHoraires = document.getElementById("message-horaires");

// 🔐 Authentification de l'utilisateur
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("⏳ Utilisateur non connecté.");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
    return;
  }

  const uid = user.uid;
  console.log("✅ Utilisateur connecté UID:", uid);

  try {
    await preRemplirFormulaire(uid);
    await preRemplirHoraires(uid);
    activerSauvegarde(uid);
    activerSauvegardeHoraires(uid);
  } catch (err) {
    console.error("❌ Erreur chargement des données :", err);
  }
});

// 📥 Pré-remplissage du formulaire contact
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
      console.log("📄 Données contact préremplies :", data);
    } else {
      console.log("ℹ️ Aucun document trouvé dans infos/ pour ce user.");
    }
  } catch (err) {
    console.error("❌ Erreur chargement infos contact :", err);
  }
}

// 💾 Sauvegarde des infos contact
function activerSauvegarde(uid) {
  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const adresse = adresseInput.value.trim();
    const codePostal = codePostalInput.value.trim();
    const lieu = lieuInput.value.trim();

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
      console.log("✅ Infos contact enregistrées avec succès.");
    } catch (error) {
      console.error("❌ Erreur Firestore lors de l'enregistrement des infos :", error);
      message.textContent = "❌ Erreur lors de la mise à jour";
      message.style.color = "red";
    }

    setTimeout(() => (message.textContent = ""), 3000);
  });
}

// 📥 Pré-remplissage dynamique
async function preRemplirHoraires(uid) {
  const horairesRef = doc(db, "horaires", uid);
  const horairesSnap = await getDoc(horairesRef);

  if (horairesSnap.exists()) {
    const horaires = horairesSnap.data();
    const liste = document.getElementById("liste-horaires");

    Object.entries(horaires).forEach(([jour, horaire]) => {
      ajouterLigne(jour, horaire);
    });
  }
}

// ➕ Ajouter une ligne d'horaire
function ajouterLigne(jour = "", horaire = "") {
  const container = document.getElementById("liste-horaires");
  const div = document.createElement("div");
  div.className = "horaire-ligne";

  const inputJour = document.createElement("input");
  inputJour.type = "text";
  inputJour.className = "jours";
  inputJour.placeholder = "Jour (ex: Lundi)";
  inputJour.value = jour;

  const inputHoraire = document.createElement("input");
  inputHoraire.type = "text";
  inputHoraire.className = "heures";
  inputHoraire.placeholder = "Horaires (ex: 08h00 - 12h00)";
  inputHoraire.value = horaire;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.onclick = () => div.remove();

  div.appendChild(inputJour);
  div.appendChild(inputHoraire);
  div.appendChild(removeBtn);
  container.appendChild(div);
}

// 💾 Sauvegarde dynamique
function activerSauvegardeHoraires(uid) {
  const saveBtn = document.getElementById("save-horaires");
  const message = document.getElementById("message-horaires");

  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    const lignes = document.querySelectorAll("#liste-horaires .horaire-ligne");
    const horaires = {};

    lignes.forEach(div => {
      const jour = div.querySelector(".jours")?.value.trim().toLowerCase();
      const horaire = div.querySelector(".heures")?.value.trim();
      if (jour && horaire) {
        horaires[jour] = horaire;
      }
    });

    try {
      await setDoc(doc(db, "horaires", uid), horaires);
      message.textContent = "✅ Horaires enregistrés";
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

// ➕ Bouton ajouter
document.getElementById("ajouter-ligne")?.addEventListener("click", () => {
  ajouterLigne();
});

