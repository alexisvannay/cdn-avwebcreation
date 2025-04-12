import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// ✅ Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRIdIXj0IixLwASOgZsqka550gOAVr7_4",
  authDomain: "avwebcreation-admin.firebaseapp.com",
  projectId: "avwebcreation-admin",
  storageBucket: "avwebcreation-admin.appspot.com",
  messagingSenderId: "293089525298",
  appId: "1:293089525298:web:68ff4408a175909699862b"
};

// ✅ Empêche l'initialisation multiple
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);


// 🎯 Références DOM - Contact
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const adresseInput = document.getElementById("adresse");
const codePostalInput = document.getElementById("codePostal");
const lieuInput = document.getElementById("lieu");
const saveBtn = document.getElementById("save");
const message = document.getElementById("message");

// 🎯 Références DOM - Horaires
const saveHorairesBtn = document.getElementById("save-horaires");
const messageHoraires = document.getElementById("message-horaires");

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
  console.log("✅ Connecté :", uid);

  try {
    await preRemplirFormulaire(uid);
    await preRemplirHoraires(uid);
    await chargerAccueil(uid);
    activerSauvegardeAccueil(uid);

    activerSauvegarde(uid);
    activerSauvegardeHoraires(uid);
  } catch (err) {
    console.error("❌ Erreur au chargement initial :", err);
  }
});

// 📥 Pré-remplissage infos de contact
async function preRemplirFormulaire(uid) {
  try {
    const docRef = doc(db, "infos", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      emailInput.value = data.email ?? "";
      phoneInput.value = data.phone ?? "";
      adresseInput.value = data.adresse ?? "";
      codePostalInput.value = data.codePostal ?? "";
      lieuInput.value = data.lieu ?? "";
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

      message.textContent = "✅ Informations mises à jour";
      message.style.color = "green";
    } catch (err) {
      console.error("❌ Erreur enregistrement contact :", err);
      message.textContent = "❌ Erreur lors de l'enregistrement";
      message.style.color = "red";
    }

    setTimeout(() => (message.textContent = ""), 3000);
  });
}

// 📥 Pré-remplissage des horaires
async function preRemplirHoraires(uid) {
  try {
    const docRef = doc(db, "horaires", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      Object.entries(data).forEach(([jourPlage, horaires]) => {
        ajouterLigne(jourPlage, horaires);
      });
    }
  } catch (err) {
    console.error("❌ Erreur chargement horaires :", err);
  }
}

// ➕ Ajouter une ligne horaire
function ajouterLigne(jour = "", horaire = "") {
  const container = document.getElementById("liste-horaires");
  if (!container) {
    console.error("❌ Élément #liste-horaires introuvable.");
    return;
  }

  const ligne = document.createElement("div");
  ligne.className = "horaire-ligne";

  const inputJour = document.createElement("input");
  inputJour.type = "text";
  inputJour.className = "jours";
  inputJour.placeholder = "Jour ou plage (ex: Lundi - Jeudi)";
  inputJour.value = jour;

  const inputHoraire = document.createElement("input");
  inputHoraire.type = "text";
  inputHoraire.className = "heures";
  inputHoraire.placeholder = "Horaires (ex: 08h - 12h, 13h30 - 17h)";
  inputHoraire.value = horaire;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.addEventListener("click", () => ligne.remove());

  ligne.appendChild(inputJour);
  ligne.appendChild(inputHoraire);
  ligne.appendChild(removeBtn);
  container.appendChild(ligne);
}

// 💾 Sauvegarde des horaires
function activerSauvegardeHoraires(uid) {
  if (!saveHorairesBtn) return;

  saveHorairesBtn.addEventListener("click", async () => {
    const lignes = document.querySelectorAll("#liste-horaires .horaire-ligne");
    const horaires = {};

    lignes.forEach(div => {
      const jour = div.querySelector(".jours")?.value.trim();
      const heure = div.querySelector(".heures")?.value.trim();
      if (jour && heure) {
        horaires[jour] = heure;
      }
    });

    try {
      await setDoc(doc(db, "horaires", uid), horaires);
      messageHoraires.textContent = "✅ Horaires enregistrés";
      messageHoraires.style.color = "green";
    } catch (error) {
      console.error("❌ Erreur Firestore :", error);
      messageHoraires.textContent = "❌ Erreur lors de la mise à jour";
      messageHoraires.style.color = "red";
    }

    setTimeout(() => (messageHoraires.textContent = ""), 3000);
  });
}

// ✅ Bouton "ajouter une ligne"
document.getElementById("ajouter-ligne")?.addEventListener("click", () => {
  ajouterLigne();
});




// 🎯 Références DOM - Accueil
const inputTexteAccueil = document.getElementById("texteAccueil");
const inputImageFichier = document.getElementById("imageAccueilFichier");
const inputImageURL = document.getElementById("imageAccueilURL");
const saveAccueilBtn = document.getElementById("save-accueil");
const messageAccueil = document.getElementById("message-accueil");

// 📥 Chargement du contenu de la page d'accueil
async function chargerAccueil(uid) {
  try {
    const accueilRef = doc(db, "accueil", uid);
    const accueilSnap = await getDoc(accueilRef);

    if (accueilSnap.exists()) {
      const data = accueilSnap.data();
      if (inputTexteAccueil) inputTexteAccueil.value = data.texte || "";
      if (inputImageURL) inputImageURL.value = data.image || "";
    }
  } catch (err) {
    console.error("❌ Erreur chargement accueil :", err);
  }
}

// 💾 Sauvegarde page d'accueil
function activerSauvegardeAccueil(uid) {
  if (!saveAccueilBtn) return;

  saveAccueilBtn.addEventListener("click", async () => {
    const texte = inputTexteAccueil?.value.trim();
    const imageURL = inputImageURL?.value.trim();

    // On pourrait aussi gérer le fichier uploadé via Storage ici

    try {
      await setDoc(doc(db, "accueil", uid), {
        texte,
        image: imageURL
      });

      messageAccueil.textContent = "✅ Accueil mis à jour";
      messageAccueil.style.color = "green";
    } catch (error) {
      console.error("❌ Erreur sauvegarde accueil :", error);
      messageAccueil.textContent = "❌ Erreur de mise à jour";
      messageAccueil.style.color = "red";
    }

    setTimeout(() => {
      messageAccueil.textContent = "";
    }, 3000);
  });
}
