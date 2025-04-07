// script-admin.js – Dashboard client avec infos de contact + horaires dynamiques

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// 🔧 Firebase config
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

// 🎯 Références DOM - contact
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const adresseInput = document.getElementById("adresse");
const codePostalInput = document.getElementById("codePostal");
const lieuInput = document.getElementById("lieu");
const saveBtn = document.getElementById("save");
const message = document.getElementById("message");

// 🎯 Références DOM - horaires
const saveHorairesBtn = document.getElementById("save-horaires");
const messageHoraires = document.getElementById("message-horaires");
let containerHoraires = document.getElementById("liste-horaires");

// 🔐 Authentification utilisateur
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("Utilisateur non connecté.");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
    return;
  }

  const uid = user.uid;
  console.log("✅ Connecté en tant que :", uid);

  try {
    await preRemplirFormulaire(uid);
    await preRemplirHoraires(uid);
    activerSauvegarde(uid);
    activerSauvegardeHoraires(uid);
  } catch (err) {
    console.error("❌ Erreur lors du chargement initial :", err);
  }
});

// 📥 Pré-remplissage infos de contact
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
    console.error("❌ Erreur chargement contact :", err);
  }
}

// 💾 Sauvegarde infos contact
function activerSauvegarde(uid) {
  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    try {
      await setDoc(doc(db, "infos", uid), {
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        adresse: adresseInput.value.trim(),
        codePostal: codePostalInput.value.trim(),
        lieu: lieuInput.value.trim()
      });

      message.textContent = "✅ Informations enregistrées avec succès";
      message.style.color = "green";
    } catch (err) {
      console.error("❌ Erreur enregistrement contact :", err);
      message.textContent = "❌ Erreur lors de l'enregistrement";
      message.style.color = "red";
    }

    setTimeout(() => message.textContent = "", 3000);
  });
}

// 📥 Pré-remplissage des horaires dynamiques
async function preRemplirHoraires(uid) {
  if (!containerHoraires) {
    containerHoraires = document.createElement("div");
    containerHoraires.id = "liste-horaires";
    document.body.appendChild(containerHoraires);
  }

  try {
    const docRef = doc(db, "horaires", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      Object.entries(data).forEach(([jour, horaires]) => {
        ajouterLigne(jour, horaires);
      });
    }
  } catch (err) {
    console.error("❌ Erreur chargement horaires :", err);
  }
}

// ➕ Ajout d’une ligne horaire
function ajouterLigne(jour = "", horaire = "") {
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
  inputHoraire.placeholder = "Horaires (ex: 08h - 12h)";
  inputHoraire.value = horaire;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.addEventListener("click", () => div.remove());

  div.appendChild(inputJour);
  div.appendChild(inputHoraire);
  div.appendChild(removeBtn);
  containerHoraires.appendChild(div);
}

// 💾 Sauvegarde des horaires dynamiques (sans éclater les plages)
function activerSauvegardeHoraires(uid) {
  const saveBtn = document.getElementById("save-horaires");
  const message = document.getElementById("message-horaires");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    const lignes = document.querySelectorAll("#liste-horaires .horaire-ligne");
    const horaires = {};

    lignes.forEach(div => {
      const champJour = div.querySelector(".jours")?.value.trim();
      const horaire = div.querySelector(".heures")?.value.trim();

      if (champJour && horaire) {
        horaires[champJour] = horaire;
      }
    });

    try {
      await setDoc(doc(db, "horaires", uid), horaires); // Enregistrement tel quel
      message.textContent = "✅ Horaires enregistrés";
      message.style.color = "green";
      console.log("✅ Horaires enregistrés :", horaires);
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

// à la toute fin du script-admin.js
document.getElementById("ajouter-ligne")?.addEventListener("click", () => {
  ajouterLigne();
});

