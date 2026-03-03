// ========== Cấu hình ==========
const PASSCODE = '0803'; // Mật mã mặc định (có thể đổi)
const GIFT_MESSAGES = ['Yêu em!', '8/3 vui vẻ!', 'Em xinh đẹp!', 'Chúc mừng em!', 'Happy Women\'s Day!', '💕', '💗', '💖'];

// ========== IndexedDB - Lưu nhạc & ảnh ==========
const DB_NAME = 'NgayPhunu083';
const DB_VERSION = 2;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('music')) {
        db.createObjectStore('music', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('soundcloud')) {
        db.createObjectStore('soundcloud', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function saveSoundCloudToDB(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('soundcloud', 'readwrite');
    const store = tx.objectStore('soundcloud');
    const req = store.add({ url });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadSoundCloudFromDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('soundcloud', 'readonly');
    const req = tx.objectStore('soundcloud').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteSoundCloudFromDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('soundcloud', 'readwrite');
    const req = tx.objectStore('soundcloud').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ========== Lock Screen ==========
const lockScreen = document.getElementById('lock-screen');
const mainScreen = document.getElementById('main-screen');
const dots = document.querySelectorAll('.passcode-dots .dot');
const passcodeError = document.getElementById('passcode-error');
const numpad = document.querySelectorAll('.num-btn[data-num]');
const deleteBtn = document.querySelector('.num-btn[data-action="delete"]');

let passcodeInput = '';

// Cập nhật dots
function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.remove('filled', 'wrong');
    if (i < passcodeInput.length) {
      dot.classList.add('filled');
    }
  });
}

// Kiểm tra mật mã
function checkPasscode() {
  if (passcodeInput === PASSCODE) {
    lockScreen.classList.remove('active');
    mainScreen.classList.add('active', 'main-screen-enter');
    loadSoundCloudFromStorage();
    loadPhotosFromStorage();
  } else {
    dots.forEach(d => d.classList.add('wrong'));
    passcodeError.classList.add('show');
    setTimeout(() => {
      passcodeInput = '';
      updateDots();
      dots.forEach(d => d.classList.remove('wrong'));
      passcodeError.classList.remove('show');
    }, 1000);
  }
}

// Sự kiện numpad
numpad.forEach(btn => {
  btn.addEventListener('click', () => {
    if (passcodeInput.length < 4) {
      passcodeInput += btn.dataset.num;
      updateDots();
      if (passcodeInput.length === 4) {
        checkPasscode();
      }
    }
  });
});

deleteBtn.addEventListener('click', () => {
  passcodeInput = passcodeInput.slice(0, -1);
  updateDots();
  passcodeError.classList.remove('show');
});

// ========== Modal chung ==========
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    modal.classList.remove('active');
    if (modal.id === 'modal-music') stopSoundCloudPlayback();
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      if (modal.id === 'modal-music') stopSoundCloudPlayback();
    }
  });
});

// ========== Cards -> Modal ==========
document.getElementById('card-music').addEventListener('click', () => {
  openModal('modal-music');
  loadSoundCloudFromStorage();
});
document.getElementById('card-letter').addEventListener('click', () => openModal('modal-letter'));
document.getElementById('card-photos').addEventListener('click', () => {
  openModal('modal-photos');
  loadPhotosFromStorage();
});
document.getElementById('card-gift').addEventListener('click', () => openModal('modal-gift'));

// ========== SoundCloud ==========
let soundcloudTracks = [];

function getSoundCloudEmbedUrl(trackUrl) {
  let url = trackUrl.trim();
  if (!url.includes('soundcloud.com')) return null;
  if (!url.startsWith('http')) url = 'https://' + url.replace(/^\/+/, '');
  return 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&color=%23ec4899&auto_play=false&hide_related=true&show_comments=false';
}

function stopSoundCloudPlayback() {
  document.querySelectorAll('#soundcloud-list iframe').forEach(iframe => {
    iframe.src = 'about:blank';
  });
}

async function loadSoundCloudFromStorage() {
  const items = await loadSoundCloudFromDB();
  soundcloudTracks = items;
  renderSoundCloudList();
}

function renderSoundCloudList() {
  const container = document.getElementById('soundcloud-list');
  container.innerHTML = '';
  soundcloudTracks.forEach((item) => {
    const embedUrl = getSoundCloudEmbedUrl(item.url);
    if (!embedUrl) return;
    const wrap = document.createElement('div');
    wrap.className = 'soundcloud-item';
    wrap.innerHTML = `
      <iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}"></iframe>
      <button class="soundcloud-remove" data-id="${item.id}" title="Xóa">×</button>
    `;
    container.appendChild(wrap);
  });
}

const soundcloudAddBtn = document.getElementById('soundcloud-add-btn');
if (soundcloudAddBtn) soundcloudAddBtn.addEventListener('click', async () => {
  const input = document.getElementById('soundcloud-url');
  const url = input.value.trim();
  if (!url || !url.includes('soundcloud.com')) {
    alert('Vui lòng dán link SoundCloud hợp lệ (vd: https://soundcloud.com/artist/bai-hat)');
    return;
  }
  await saveSoundCloudToDB(url);
  input.value = '';
  await loadSoundCloudFromStorage();
});

const soundcloudUrlInput = document.getElementById('soundcloud-url');
if (soundcloudUrlInput) soundcloudUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && soundcloudAddBtn) soundcloudAddBtn.click();
});

document.getElementById('soundcloud-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('.soundcloud-remove');
  if (btn) {
    await deleteSoundCloudFromDB(+btn.dataset.id);
    await loadSoundCloudFromStorage();
  }
});

// ========== Letter ==========
// Nội dung thư có thể sửa trực tiếp trong index.html tại #letter-body

// ========== Photos (từ thư mục images) ==========
const photoSlideTop = document.getElementById('photo-slide-top');
const photoSlideBottom = document.getElementById('photo-slide-bottom');
const photoViewModal = document.getElementById('modal-photo-view');
const photoFull = document.getElementById('photo-full');

let photoUrls = [];

function loadPhotosFromStorage() {
  const files = (typeof window.PHOTO_FILES !== 'undefined' && Array.isArray(window.PHOTO_FILES))
    ? window.PHOTO_FILES
    : [];
  photoUrls = files.map(f => {
    const path = f.startsWith('images/') ? f : 'images/' + f;
    return new URL(path, window.location.href).href;
  });
  renderPhotos();
}

function renderPhotos() {
  if (!photoSlideTop || !photoSlideBottom) return;
  photoSlideTop.innerHTML = '';
  photoSlideBottom.innerHTML = '';
  if (photoUrls.length === 0) return;

  const createImg = (url) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Ảnh';
    img.loading = 'lazy';
    img.onerror = () => { img.style.display = 'none'; };
    img.addEventListener('click', () => {
      if (photoFull && photoViewModal) {
        photoFull.src = url;
        photoViewModal.classList.add('active');
      }
    });
    return img;
  };

  const topSet1 = photoUrls.map(createImg);
  const topSet2 = photoUrls.map(createImg);
  const bottomSet1 = photoUrls.map(createImg);
  const bottomSet2 = photoUrls.map(createImg);

  topSet1.forEach(el => photoSlideTop.appendChild(el));
  topSet2.forEach(el => photoSlideTop.appendChild(el));
  [...bottomSet1].reverse().forEach(el => photoSlideBottom.appendChild(el));
  [...bottomSet2].reverse().forEach(el => photoSlideBottom.appendChild(el));
}

// ========== Gift (Hoa + Trái tim rơi) ==========
const flowerContainer = document.getElementById('flower-container');
const fallingHearts = document.getElementById('falling-hearts');

document.getElementById('modal-gift').addEventListener('click', (e) => {
  if (e.target.closest('.modal-close')) return;
}, true);

document.getElementById('card-gift').addEventListener('click', () => {
  openModal('modal-gift');
  fallingHearts.innerHTML = '';
  showFlower();
});

function showFlower() {
  flowerContainer.innerHTML = '<div class="flower-emoji">🌸</div>';
  setTimeout(() => startFallingHearts(), 1500);
}

function startFallingHearts() {
  const items = ['❤️', '💕', '💗', '💖', '💘', '💝', '🌸', '💐', ...GIFT_MESSAGES];
  const interval = setInterval(() => {
    createFallingItem(items[Math.floor(Math.random() * items.length)]);
  }, 400);

  setTimeout(() => clearInterval(interval), 10000);
}

function createFallingItem(text) {
  const el = document.createElement('div');
  el.className = 'falling-item';
  el.textContent = text;
  el.style.left = Math.random() * 100 + '%';
  el.style.animationDuration = (4 + Math.random() * 4) + 's';
  el.style.color = ['#ec4899', '#db2777', '#f472b6', '#be185d'][Math.floor(Math.random() * 4)];
  fallingHearts.appendChild(el);
  setTimeout(() => el.remove(), 10000);
}
