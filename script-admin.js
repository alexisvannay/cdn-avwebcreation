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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

// 📌 DOM
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const adresseInput = document.getElementById("adresse");
const codePostalInput = document.getElementById("codePostal");
const lieuInput = document.getElementById("lieu");
const saveBtn = document.getElementById("save");
const message = document.getElementById("message");
const saveHorairesBtn = document.getElementById("save-horaires");
const messageHoraires = document.getElementById("message-horaires");
const inputTexteLogo1 = document.getElementById("texteLogo1");
const inputTexteLogo2 = document.getElementById("texteLogo2");
const inputLogoFichier = document.getElementById("logoFichier");
const boutonSauvegardeLogo = document.getElementById("save-logo");
const inputLogoURL = document.getElementById("logoURL");
const inputTexteAccueil = document.getElementById("texteAccueil");
const inputImageFichier = document.getElementById("imageAccueilFichier");
const inputImageURL = document.getElementById("imageAccueilURL");
const saveAccueilBtn = document.getElementById("save-accueil");
const messageAccueil = document.getElementById("message-accueil");

// 🔐 Auth
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    setTimeout(() => window.location.href = "index.html", 1000);
    return;
  }

  const uid = user.uid;
  await preRemplirFormulaire(uid);
  await preRemplirHoraires(uid);
  await chargerAccueil(uid);
  await chargerLogo(uid);

  activerSauvegarde(uid);
  activerSauvegardeHoraires(uid);
  activerSauvegardeAccueil(uid);
  activerSauvegardeLogo(uid);
});

async function preRemplirFormulaire(uid) {
  const docSnap = await getDoc(doc(db, "infos", uid));
  if (docSnap.exists()) {
    const d = docSnap.data();
    emailInput.value = d.email || "";
    phoneInput.value = d.phone || "";
    adresseInput.value = d.adresse || "";
    codePostalInput.value = d.codePostal || "";
    lieuInput.value = d.lieu || "";
  }
}

function activerSauvegarde(uid) {
  saveBtn?.addEventListener("click", async () => {
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
    } catch {
      message.textContent = "❌ Erreur lors de l'enregistrement";
      message.style.color = "red";
    }
    setTimeout(() => message.textContent = "", 3000);
  });
}

async function preRemplirHoraires(uid) {
  const snap = await getDoc(doc(db, "horaires", uid));
  if (snap.exists()) {
    const d = snap.data();
    Object.entries(d).forEach(([j, h]) => ajouterLigne(j, h));
  }
}

function ajouterLigne(j = "", h = "") {
  const container = document.getElementById("liste-horaires");
  const div = document.createElement("div");
  div.className = "horaire-ligne";
  div.innerHTML = `<input class="jours" placeholder="Jour ou plage" value="${j}">
                   <input class="heures" placeholder="Horaires" value="${h}">
                   <button>🗑</button>`;
  div.querySelector("button").addEventListener("click", () => div.remove());
  container?.appendChild(div);
}

function activerSauvegardeHoraires(uid) {
  saveHorairesBtn?.addEventListener("click", async () => {
    const lignes = document.querySelectorAll("#liste-horaires .horaire-ligne");
    const horaires = {};
    lignes.forEach(div => {
      const jour = div.querySelector(".jours")?.value.trim();
      const heure = div.querySelector(".heures")?.value.trim();
      if (jour && heure) horaires[jour] = heure;
    });
    try {
      await setDoc(doc(db, "horaires", uid), horaires);
      messageHoraires.textContent = "✅ Horaires enregistrés";
      messageHoraires.style.color = "green";
    } catch {
      messageHoraires.textContent = "❌ Erreur lors de la mise à jour";
      messageHoraires.style.color = "red";
    }
    setTimeout(() => messageHoraires.textContent = "", 3000);
  });
}

document.getElementById("ajouter-ligne")?.addEventListener("click", () => ajouterLigne());

inputImageFichier?.addEventListener("change", () => {
  const fichier = inputImageFichier.files[0];
  if (!fichier) return;
  const reader = new FileReader();
  reader.onload = e => inputImageURL.value = e.target.result;
  reader.readAsDataURL(fichier);
});


// 🔄 Met à jour automatiquement l’URL du logo si un fichier est sélectionné
inputLogoFichier?.addEventListener("change", () => {
  const fichier = inputLogoFichier.files[0];
  if (!fichier) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const logoURLInput = document.getElementById("logoURL");
    if (logoURLInput) {
      logoURLInput.value = e.target.result; // base64 data:image/... automatiquement
    }
  };
  reader.readAsDataURL(fichier);
});


async function chargerAccueil(uid) {
  const snap = await getDoc(doc(db, "accueil", uid));
  if (snap.exists()) {
    const d = snap.data();
    inputTexteAccueil.value = d.texte || "";
    inputImageURL.value = d.image || "";
  }
}

async function chargerLogo(uid) {
  const snap = await getDoc(doc(db, "logo", uid));
  if (snap.exists()) {
    const d = snap.data();
    inputTexteLogo1.value = d.texte1 || "";
    inputTexteLogo2.value = d.texte2 || "";
    inputLogoURL.value = d.urlLogo || "";
  }
}

function activerSauvegardeAccueil(uid) {
  saveAccueilBtn?.addEventListener("click", async () => {
    const texte = inputTexteAccueil?.value.trim();
    const imageURL = inputImageURL?.value.trim();
    try {
      await setDoc(doc(db, "accueil", uid), { texte, image: imageURL });
      messageAccueil.textContent = "✅ Accueil mis à jour";
      messageAccueil.style.color = "green";
    } catch {
      messageAccueil.textContent = "❌ Erreur de mise à jour";
      messageAccueil.style.color = "red";
    }
    setTimeout(() => messageAccueil.textContent = "", 3000);
  });
}

function activerSauvegardeLogo(uid) {
  boutonSauvegardeLogo?.addEventListener("click", async () => {
    const texte1 = inputTexteLogo1?.value.trim();
    const texte2 = inputTexteLogo2?.value.trim();
    const urlLogo = inputLogoURL?.value.trim();
    try {
      await setDoc(doc(db, "logo", uid), { texte1, texte2, urlLogo });
      boutonSauvegardeLogo.textContent = "✅ Enregistré !";
      boutonSauvegardeLogo.style.backgroundColor = "green";
    } catch {
      boutonSauvegardeLogo.textContent = "❌ Erreur";
      boutonSauvegardeLogo.style.backgroundColor = "red";
    }
    setTimeout(() => {
      boutonSauvegardeLogo.textContent = "Enregistrer";
      boutonSauvegardeLogo.style.backgroundColor = "";
    }, 3000);
  });
}
