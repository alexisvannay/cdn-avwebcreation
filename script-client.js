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

// 🔍 Lire l'UID depuis le meta tag
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
        document.getElementById("contact-email").textContent = data.email ?? "–";
        document.getElementById("contact-phone").textContent = data.phone ?? "–";
        document.getElementById("contact-adresse").textContent = `${data.adresse ?? ""}, ${data.codePostal ?? ""} ${data.lieu ?? ""}`.trim();
      }

      // 🕒 Chargement horaires SANS décomposition
      const horairesRef = doc(db, "horaires", uid);
      const horairesSnap = await getDoc(horairesRef);

      if (horairesSnap.exists()) {
        const horaires = horairesSnap.data();
        const container = document.getElementById("liste-horaires");
        container.innerHTML = "";

        Object.entries(horaires).forEach(([plage, horaire]) => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${plage.charAt(0).toUpperCase() + plage.slice(1)} :</strong> ${horaire}`;
          container.appendChild(li);
        });
      }

    } catch (error) {
      console.error("❌ Erreur de chargement :", error);
    }
  }

  chargerInfosClient();
}
