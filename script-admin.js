import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy
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
const nomEntrepriseInput = document.getElementById("nomEntreprise");
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
  await chargerGalerie(uid);
                    

  activerSauvegarde(uid);
  activerSauvegardeHoraires(uid);
  activerSauvegardeAccueil(uid);
  activerSauvegardeLogo(uid);
  activerSauvegardePresentation(uid);
  activerAjoutImage(uid);

});

async function preRemplirFormulaire(uid) {
  const docSnap = await getDoc(doc(db, "infos", uid));
  if (docSnap.exists()) {
    const d = docSnap.data();
    nomEntrepriseInput.value = d.nomEntreprise || "";
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
        nomEntreprise: nomEntrepriseInput.value.trim(),
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
  div.innerHTML = `<div class="div-input-horaires">
                      <input class="jours" placeholder="Jour ou plage" value="${j}">
                      <input class="heures" placeholder="Horaires" value="${h}">
                    </div>
                   <button class="bouton-supprimer-ligne">supprimer</button>`;
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





// 📷 Charger la galerie depuis la sous-collection
async function chargerGalerie(uid) {
  const imagesRef = collection(db, "galerie", uid, "images");
  const q = query(imagesRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  listeImages.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const url = docSnap.data().url;
    const docId = docSnap.id;

    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";
    container.style.margin = "6px";

    const img = document.createElement("img");
    img.src = url;
    
    img.style.borderRadius = "4px";
    img.style.transition = "transform 0.2s";
    img.addEventListener("mouseenter", () => (img.style.transform = "scale(1.05)"));
    img.addEventListener("mouseleave", () => (img.style.transform = "scale(1)"));

    const btn = document.createElement("button");
    btn.textContent = "supprimer";
    btn.style.cssText = `
      font-size: 12px;
      position: absolute;
      top: 2px;
      right: 2px;
      background: red;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
    `;

    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "galerie", uid, "images", docId));
      container.remove();
      messageGalerie.textContent = "🗑️ Image supprimée";
      messageGalerie.style.color = "orange";
      setTimeout(() => (messageGalerie.textContent = ""), 3000);
    });

    container.appendChild(img);
    container.appendChild(btn);
    listeImages.appendChild(container);
  });
}

// ➕ Ajouter une image directement dans Firestore
function activerAjoutImage(uid) {
  ajouterBtn?.addEventListener("click", async () => {
    const url = imageURLInput.value.trim();
    if (!url) return;

    // Vérifie si l’image est déjà dans la liste affichée
    const dejaPresente = [...listeImages.querySelectorAll("img")].some(img => img.src === url);
    if (dejaPresente) {
      messageGalerie.textContent = "⚠️ Cette image est déjà présente";
      messageGalerie.style.color = "orange";
      setTimeout(() => (messageGalerie.textContent = ""), 3000);
      return;
    }

    try {
      await addDoc(collection(db, "galerie", uid, "images"), {
        url,
        createdAt: new Date(),
      });
      imageInput.value = "";
      imageURLInput.value = "";
      await chargerGalerie(uid);
      messageGalerie.textContent = "✅ Image ajoutée avec succès";
      messageGalerie.style.color = "green";
    } catch (e) {
      console.error(e);
      messageGalerie.textContent = "❌ Erreur lors de l'ajout";
      messageGalerie.style.color = "red";
    }

    setTimeout(() => (messageGalerie.textContent = ""), 3000);
  });

  imageInput?.addEventListener("change", () => {
    const fichier = imageInput.files[0];
    if (!fichier) return;
    const reader = new FileReader();
    reader.onload = (e) => (imageURLInput.value = e.target.result);
    reader.readAsDataURL(fichier);
  });
}


