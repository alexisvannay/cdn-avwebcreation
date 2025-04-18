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



const imageInput = document.getElementById("imageGalerieFichier");
const imageURLInput = document.getElementById("imageGalerieURL");
const ajouterBtn = document.getElementById("ajouter-image-galerie");
const enregistrerBtn = document.getElementById("enregistrer-galerie");
const messageGalerie = document.getElementById("message-galerie");
const listeImages = document.getElementById("liste-images-galerie");

let imagesTemp = [];

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
  await chargerPresentation(uid);
  await chargerGalerie(uid);

  activerSauvegarde(uid);
  activerSauvegardeHoraires(uid);
  activerSauvegardeAccueil(uid);
  activerSauvegardeLogo(uid);
  activerSauvegardePresentation(uid);
  activerSauvegardeGalerie(uid);


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
                   <button class="bouton-supprimer-ligne">🗑</button>`;
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


// 🎯 Références DOM - Présentation
const inputTextePresentation1 = document.getElementById("textePresentation1");
const inputTextePresentation2 = document.getElementById("textePresentation2");
const inputImagePresentationURL1 = document.getElementById("imagePresentationURL1");
const inputImagePresentationURL2 = document.getElementById("imagePresentationURL2");
const inputImageFichier1 = document.getElementById("imagePresentationFichier1");
const inputImageFichier2 = document.getElementById("imagePresentationFichier2");
const boutonSavePresentation = document.getElementById("save-presentation");
const messagePresentation = document.getElementById("message-presentation");

// 🔁 Convertit l’image en base64 et la met dans le champ texte
[inputImageFichier1, inputImageFichier2].forEach((input, i) => {
  input?.addEventListener("change", () => {
    const fichier = input.files[0];
    if (!fichier) return;
    const reader = new FileReader();
    reader.onload = e => {
      if (i === 0) inputImagePresentationURL1.value = e.target.result;
      else inputImagePresentationURL2.value = e.target.result;
    };
    reader.readAsDataURL(fichier);
  });
});

// 📥 Charger la présentation si elle existe
async function chargerPresentation(uid) {
  const snap = await getDoc(doc(db, "presentation", uid));
  if (snap.exists()) {
    const d = snap.data();
    inputTextePresentation1.value = d.texte1 || "";
    inputImagePresentationURL1.value = d.image1 || "";
    inputTextePresentation2.value = d.texte2 || "";
    inputImagePresentationURL2.value = d.image2 || "";
  }
}

// 💾 Sauvegarde de la présentation
function activerSauvegardePresentation(uid) {
  boutonSavePresentation?.addEventListener("click", async () => {
    const texte1 = inputTextePresentation1?.value.trim();
    const texte2 = inputTextePresentation2?.value.trim();
    const image1 = inputImagePresentationURL1?.value.trim();
    const image2 = inputImagePresentationURL2?.value.trim();

    try {
      await setDoc(doc(db, "presentation", uid), { texte1, image1, texte2, image2 });
      messagePresentation.textContent = "✅ Présentation enregistrée";
      messagePresentation.style.color = "green";
    } catch {
      messagePresentation.textContent = "❌ Erreur de sauvegarde";
      messagePresentation.style.color = "red";
    }

    setTimeout(() => messagePresentation.textContent = "", 3000);
  });
}







// 📥 Charger la galerie si elle existe
async function chargerGalerie(uid) {
  const snap = await getDoc(doc(db, "galerie", uid));
  if (snap.exists()) {
    const data = snap.data();
    if (Array.isArray(data.images)) {
      imagesTemp = [...data.images];
      listeImages.innerHTML = "";
      data.images.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.maxHeight = "100px";
        img.style.margin = "6px";
        img.style.borderRadius = "4px";
        listeImages.appendChild(img);
      });
    }
  }
}

// 💾 Sauvegarde de la galerie
function activerSauvegardeGalerie(uid) {
  enregistrerBtn?.addEventListener("click", async () => {
    try {
      await setDoc(doc(db, "galerie", uid), { images: imagesTemp });
      messageGalerie.textContent = "✅ Galerie enregistrée";
      messageGalerie.style.color = "green";
    } catch (err) {
      console.error(err);
      messageGalerie.textContent = "❌ Erreur d'enregistrement";
      messageGalerie.style.color = "red";
    }

    setTimeout(() => (messageGalerie.textContent = ""), 3000);
  });

  ajouterBtn?.addEventListener("click", () => {
    const url = imageURLInput.value.trim();
    if (!url) return;

    imagesTemp.push(url);
    const img = document.createElement("img");
    img.src = url;
    img.style.maxHeight = "100px";
    img.style.margin = "6px";
    img.style.borderRadius = "4px";
    listeImages.appendChild(img);

    imageInput.value = "";
    imageURLInput.value = "";
  });

  imageInput?.addEventListener("change", () => {
    const fichier = imageInput.files[0];
    if (!fichier) return;
    const reader = new FileReader();
    reader.onload = e => imageURLInput.value = e.target.result;
    reader.readAsDataURL(fichier);
  });
}

