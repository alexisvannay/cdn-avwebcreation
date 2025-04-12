import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

// 🔍 Lire l'UID depuis la balise meta
const metaUid = document.querySelector('meta[name="client-uid"]');
if (!metaUid) {
  console.error("❌ UID manquant dans la balise meta.");
} else {
  const uid = metaUid.content;

  async function chargerInfosClient() {
    try {
      // 📄 Chargement infos de contact
      const contactRef = doc(db, "infos", uid);
      const contactSnap = await getDoc(contactRef);

      if (contactSnap.exists()) {
        const data = contactSnap.data();
        document.querySelectorAll(".contact-email").forEach(el => {
          el.textContent = data.email ?? "–";
        });
        
        document.querySelectorAll(".contact-phone").forEach(el => {
          el.textContent = data.phone ?? "–";
        });
        
        document.querySelectorAll(".contact-adresse").forEach(el => {
          el.textContent = `${data.adresse ?? ""}, ${data.codePostal ?? ""} ${data.lieu ?? ""}`.trim() || "–";
        });

      }

      // 🕒 Chargement horaires triés
      const horairesRef = doc(db, "horaires", uid);
      const horairesSnap = await getDoc(horairesRef);

      if (horairesSnap.exists()) {
        const horaires = horairesSnap.data();
        const container = document.getElementById("liste-horaires");
        container.innerHTML = "";

        const ordreJours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

        const horairesTries = Object.entries(horaires).sort(([a], [b]) => {
          const getIndex = (label) => {
            for (let i = 0; i < ordreJours.length; i++) {
              if (label.toLowerCase().includes(ordreJours[i])) return i;
            }
            return 99; // placer en bas si jour non reconnu
          };
          return getIndex(a) - getIndex(b);
        });

        horairesTries.forEach(([plage, horaire]) => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${plage.charAt(0).toUpperCase() + plage.slice(1)} :</strong> ${horaire}`;
          container.appendChild(li);
        });
      }


      // 🌟 Chargement des infos page d'accueil
const accueilRef = doc(db, "accueil", uid);
const accueilSnap = await getDoc(accueilRef);

if (accueilSnap.exists()) {
  const data = accueilSnap.data();

  // Mise à jour du texte d’accueil
  const elTexte = document.querySelector(".texte-accueil");
  if (elTexte && data.texte) {
    elTexte.textContent = data.texte;
  }

  // Mise à jour de l’image de fond
  const sectionAccueil = document.querySelector(".accueil");
  if (sectionAccueil) {
  const imageUrl = data.image
    ? data.image
    : "images/accueil.avif"; // 

  sectionAccueil.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${imageUrl})`;
  sectionAccueil.style.backgroundSize = "cover";
  sectionAccueil.style.backgroundPosition = "center";
  sectionAccueil.style.backgroundRepeat = "no-repeat";
}

}

    } catch (error) {
      console.error("❌ Erreur de chargement :", error);
    }
  }

  chargerInfosClient();
}
