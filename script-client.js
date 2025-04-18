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

// 🔥 Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Lire l'UID depuis la balise meta
let uid = null;
const metaUid = document.querySelector('meta[name="client-uid"]');
if (metaUid) {
  uid = metaUid.content;
} else {
  console.error("❌ UID manquant dans la balise meta.");
}

// 🧠 Fonction principale
async function chargerInfosClient() {
  try {
    // 🔹 Infos de contact
    const contactRef = doc(db, "infos", uid);
    const contactSnap = await getDoc(contactRef);
    if (contactSnap.exists()) {
      const data = contactSnap.data();
      document.querySelectorAll(".contact-email").forEach(el => el.textContent = data.email ?? "–");
      document.querySelectorAll(".contact-phone").forEach(el => el.textContent = data.phone ?? "–");
      document.querySelectorAll(".contact-adresse").forEach(el => {
        el.textContent = `${data.adresse ?? ""}, ${data.codePostal ?? ""} ${data.lieu ?? ""}`.trim() || "–";
      });
    }

    // 🔹 Horaires (triés)
    const horairesRef = doc(db, "horaires", uid);
    const horairesSnap = await getDoc(horairesRef);
    if (horairesSnap.exists()) {
      const horaires = horairesSnap.data();
      const container = document.getElementById("liste-horaires");
      if (container) {
        container.innerHTML = "";
        const ordreJours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        const horairesTries = Object.entries(horaires).sort(([a], [b]) => {
          const getIndex = (label) => ordreJours.findIndex(j => label.toLowerCase().includes(j));
          return getIndex(a) - getIndex(b);
        });

        horairesTries.forEach(([plage, horaire]) => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${plage.charAt(0).toUpperCase() + plage.slice(1)} :</strong> ${horaire}`;
          container.appendChild(li);
        });
      }
    }

    // 🔹 Page d'accueil
    const accueilRef = doc(db, "accueil", uid);
    const accueilSnap = await getDoc(accueilRef);
    if (accueilSnap.exists()) {
      const data = accueilSnap.data();
      const elTexte = document.querySelector(".texte-accueil");
      if (elTexte && data.texte) elTexte.textContent = data.texte;

      const sectionAccueil = document.querySelector(".accueil");
      if (sectionAccueil) {
        const imageUrl = data.image || "images/accueil.avif";
        sectionAccueil.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${imageUrl})`;
        sectionAccueil.style.backgroundSize = "cover";
        sectionAccueil.style.backgroundPosition = "center";
        sectionAccueil.style.backgroundRepeat = "no-repeat";
      }
    }

    

    // 🔹 Logo (textes + image)
    const logoRef = doc(db, "logo", uid);
    const logoSnap = await getDoc(logoRef);
    if (logoSnap.exists()) {
      const logoData = logoSnap.data();
      document.querySelectorAll(".logo1").forEach(el => el.textContent = logoData.texte1 ?? "");
      document.querySelectorAll(".logo2").forEach(el => el.textContent = logoData.texte2 ?? "");

      if (logoData.urlLogo) {
        const logoImage = document.querySelector(".logo img");
        if (logoImage) logoImage.src = logoData.urlLogo;
      }
    }

    // 🔹 Présentation
    const presentationRef = doc(db, "presentation", uid);
    const presentationSnap = await getDoc(presentationRef);
    if (presentationSnap.exists()) {
      const data = presentationSnap.data();

      // Texte
      document.querySelectorAll(".texte-presentation-1").forEach(el => {
        el.textContent = data.texte1 ?? "";
      });
      document.querySelectorAll(".texte-presentation-2").forEach(el => {
        el.textContent = data.texte2 ?? "";
      });

      // Images
      const img1 = document.querySelector(".image-presentation-1");
      const img2 = document.querySelector(".image-presentation-2");

      if (img1 && data.image1) img1.src = data.image1;
      if (img2 && data.image2) img2.src = data.image2;
    }

  } catch (error) {
    console.error("❌ Erreur de chargement :", error);
  }
}

// 🚀 Lancer la fonction après chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  if (uid) {
    chargerInfosClient();
    chargerGalerie(); // 👈 on ajoute ça
  }
});


async function chargerGalerie() {
  try {
    const galerieRef = doc(db, "galerie", uid);
    const galerieSnap = await getDoc(galerieRef);

    if (galerieSnap.exists()) {
      const data = galerieSnap.data();
      if (Array.isArray(data.images)) {
        const container = document.querySelector(".galerie");
        if (!container) return;

        container.innerHTML = ""; // on vide au cas où

        [...data.images].reverse().forEach(url => {
            const img = document.createElement("img");
            ...
            listeImages.appendChild(img);
          });

        initLightbox(data.images); // active la lightbox
      }
    }
  } catch (err) {
    console.error("❌ Erreur chargement galerie :", err);
  }
}

function initLightbox(images) {
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector(".lightbox-img");
  const closeBtn = document.querySelector(".lightbox .close");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  let currentIndex = 0;

  document.querySelectorAll(".img-galerie").forEach((img, i) => {
    img.addEventListener("click", () => {
      currentIndex = i;
      showImage();
      lightbox.style.display = "flex";
    });
  });

  function showImage() {
    lightboxImg.src = images[currentIndex];
  }

  closeBtn?.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  nextBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage();
  });

  prevBtn?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage();
  });

  // Fermer avec la touche ÉCHAP
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lightbox.style.display = "none";
  });
}

