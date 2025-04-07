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
      // 🔹 Infos de contact
      const contactRef = doc(db, "infos", uid);
      const contactSnap = await getDoc(contactRef);

      if (contactSnap.exists()) {
        const data = contactSnap.data();
        const emailEl = document.getElementById("contact-email");
        const phoneEl = document.getElementById("contact-phone");
        const adresseEl = document.getElementById("contact-adresse");

        if (emailEl) emailEl.textContent = data.email ?? "–";
        if (phoneEl) phoneEl.textContent = data.phone ?? "–";
        if (adresseEl)
          adresseEl.textContent = `${data.adresse ?? ""}, ${data.codePostal ?? ""} ${data.lieu ?? ""}`.trim() || "–";

        console.log("✅ Données contact chargées :", data);
      } else {
        console.warn("ℹ️ Aucune info de contact trouvée.");
      }

      // 🔹 Chargement des horaires
const horairesRef = doc(db, "horaires", uid);
const horairesSnap = await getDoc(horairesRef);

if (horairesSnap.exists()) {
  const horaires = horairesSnap.data();
  const container = document.getElementById("liste-horaires");
  container.innerHTML = ""; // vide la liste avant d’ajouter

  const joursOrdre = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  joursOrdre.forEach(jour => {
    const horaire = horaires[jour];
    if (horaire) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${jour.charAt(0).toUpperCase() + jour.slice(1)} :</strong> ${horaire}`;
      container.appendChild(li);
    }
  });

  console.log("✅ Horaires affichés dans le bon ordre :", horaires);
} else {
  console.warn("ℹ️ Aucun horaire trouvé.");
}


  // Appel de la fonction
  chargerInfosClient();
}
