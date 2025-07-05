// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDb-0IL0YmzQVnl-WX47xmoLTsAgVZQBVA",
  authDomain: "pixelgrid-ebd32.firebaseapp.com",
  databaseURL: "https://pixelgrid-ebd32-default-rtdb.firebaseio.com",
  projectId: "pixelgrid-ebd32",
  storageBucket: "pixelgrid-ebd32.appspot.com",
  messagingSenderId: "137062804380",
  appId: "1:137062804380:web:e2b42f18b2dd51170d7659"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const gridElement = document.getElementById("grid");
const usernameInput = document.getElementById("username");
const cooldownTimerElement = document.getElementById("cooldown-timer");

const cols = 120;
const rows = 55;
const cooldown = 5 * 60 * 1000; // 5 minutes en ms

// Charger le prénom depuis localStorage si existant
if (localStorage.getItem("username")) {
  usernameInput.value = localStorage.getItem("username");
}

// Sauvegarder le prénom à chaque changement
usernameInput.addEventListener("input", () => {
  localStorage.setItem("username", usernameInput.value.trim());
});

// Mise à jour affichage cooldown
function updateCooldownDisplay() {
  const lastPaint = localStorage.getItem("lastPaintTimestamp");
  const now = Date.now();

  if (!lastPaint || now - lastPaint >= cooldown) {
    cooldownTimerElement.textContent = "Cooldown : prêt";
    return;
  }

  const diff = cooldown - (now - lastPaint);
  const seconds = Math.ceil(diff / 1000);
  if (seconds > 59) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    cooldownTimerElement.textContent = `Cooldown : ${minutes}m ${secs}s`;
  } else {
    cooldownTimerElement.textContent = `Cooldown : ${seconds}s`;
  }
}

// Met à jour toutes les secondes
setInterval(updateCooldownDisplay, 1000);
// Affiche immédiatement au chargement
updateCooldownDisplay();

for (let y = 0; y < rows; y++) {
  const row = document.createElement("div");
  row.classList.add("row");

  for (let x = 0; x < cols; x++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.x = x;
    cell.dataset.y = y;
    row.appendChild(cell);

    // Références Firebase pour couleur et user
    const cellRef = db.ref(`pixels/${x}_${y}`);

    // Écouter les changements en temps réel
    cellRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data && data.color) {
        cell.style.backgroundColor = data.color;
      } else {
        cell.style.backgroundColor = "white";
      }
    });

    // Clic sur la cellule
    cell.addEventListener("click", () => {
      const username = usernameInput.value.trim();

      if (!username) {
        alert("Merci de renseigner ton prénom avant de modifier un pixel.");
        usernameInput.focus();
        return;
      }

      const lastPaint = localStorage.getItem("lastPaintTimestamp");
      const now = Date.now();

      cellRef.once("value").then((snapshot) => {
        const data = snapshot.val();

        if (data && data.color && data.user) {
          // Popup info pixel colorié
          alert(
            `Le pixel appartient à :\n` +
            `Prénom : ${data.user}\n` +
            `Couleur : ${data.color}`
          );

          // Bloquer recoloration si cooldown actif (silencieux)
          if (lastPaint && now - lastPaint < cooldown) {
            return;
          }

          // Proposer recoloration
          const newColor = prompt("Quelle couleur veux-tu mettre ? (ex: red, #00FF00, rgb(0,0,255))");
          if (newColor) {
            cellRef.set({
              color: newColor,
              user: username
            });
            localStorage.setItem("lastPaintTimestamp", now);
            updateCooldownDisplay();
          }

        } else {
          // Pixel blanc, pas de popup, mais cooldown silencieux
          if (lastPaint && now - lastPaint < cooldown) {
            return;
          }

          // Proposer coloration
          const newColor = prompt("Ce pixel est blanc. Quelle couleur veux-tu mettre ?");
          if (newColor) {
            cellRef.set({
              color: newColor,
              user: username
            });
            localStorage.setItem("lastPaintTimestamp", now);
            updateCooldownDisplay();
          }
        }
      });
    });
  }
  gridElement.appendChild(row);
}
