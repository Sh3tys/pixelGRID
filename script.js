// Configuration Firebase
 const firebaseConfig = {
      apiKey: "AIzaSyDb-0IL0YmzQVnl-WX47xmoLTsAgVZQBVA",
      authDomain: "pixelgrid-ebd32.firebaseapp.com",
      databaseURL: "https://pixelgrid-ebd32-default-rtdb.firebaseio.com",
      projectId: "pixelgrid-ebd32",
      storageBucket: "pixelgrid-ebd32.firebasestorage.app",
      messagingSenderId: "137062804380",
      appId: "1:137062804380:web:e2b42f18b2dd51170d7659",
      measurementId: "G-82E388FSSE"
    };

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const gridSize = 20;
const cooldown = 5 * 60 * 1000; // 5 minutes
const lastClickKey = 'lastClickTime';

const gridElement = document.getElementById('grid');

// Génère la grille
for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    const div = document.createElement('div');
    div.className = 'pixel';
    div.dataset.x = x;
    div.dataset.y = y;

    div.addEventListener('click', () => {
      const now = Date.now();
      const lastClick = parseInt(localStorage.getItem(lastClickKey)) || 0;
      if (now - lastClick < cooldown) {
        alert("Attendez encore un peu !");
        return;
      }

      const color = prompt("Choisissez une couleur (ex: red, #00ff00)");
      if (!color) return;

      const ref = db.ref(`grid/${x}_${y}`);
      ref.set(color);
      localStorage.setItem(lastClickKey, now.toString());
    });

    gridElement.appendChild(div);
  }
}

// Écoute les changements en temps réel
db.ref('grid').on('value', snapshot => {
  const data = snapshot.val();
  if (!data) return;
  for (const key in data) {
    const color = data[key];
    const [x, y] = key.split('_');
    const pixel = document.querySelector(`.pixel[data-x="${x}"][data-y="${y}"]`);
    if (pixel) {
      pixel.style.backgroundColor = color;
    }
  }
});
