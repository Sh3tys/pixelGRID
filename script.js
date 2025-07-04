// Configuration Firebase
const firebaseConfig = {
  apiKey: "xxx",
  authDomain: "xxx",
  databaseURL: "https://xxx.firebaseio.com",
  projectId: "xxx",
  storageBucket: "xxx",
  messagingSenderId: "xxx",
  appId: "xxx"
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
