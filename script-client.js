// script-client.js – Lecture des infos depuis Firestore (public)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// ✅ Configuration Firebase
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

// 🔍 UID depuis la balise meta
const metaUid = document.querySelector('meta[name="client-uid"]');
if (!metaUid) {
  console.error("❌ UID non trouvé dans la balise <meta name='client-uid'>");
} else {
  const uid = metaUid.content;

  async function chargerInfosClient() {
    try {
      const docRef = doc(db, "infos", uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn("Aucune donnée trouvée pour ce client.");
        return;
      }

      const data = docSnap.data();

      // Contact
      const emailEl = document.getElementById("contact-email");
      const phoneEl = document.getElementById("contact-phone");
      const adresseEl = document.getElementById("contact-adresse");

      if (emailEl) emailEl.textContent = data.email ?? "–";
      if (phoneEl) phoneEl.textContent = data.phone ?? "–";
      if (adresseEl) {
        adresseEl.textContent = `${data.adresse ?? ""}, ${data.codePostal ?? ""} ${data.lieu ?? ""}`.trim() || "–";
      }

      // Horaires
      const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
      jours.forEach(jour => {
        const span = document.getElementById(`horaire-${jour}`);
        if (span) {
          span.textContent = data[`horaire_${jour}`] ?? "Fermé";
        }
      });

    } catch (error) {
      console.error("❌ Erreur de chargement Firestore :", error);
    }
  }

  chargerInfosClient();
}
