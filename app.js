// ========== Cấu hình cơ bản ==========
const PASSCODE = '0803';
const GIFT_MESSAGES = ['Yêu em!', '8/3 vui vẻ!', 'Em xinh đẹp!', 'Chúc mừng em!', 'Happy Women\'s Day!', '💕', '💗', '💖'];

// ========== Lock Screen ==========
const lockScreen = document.getElementById('lock-screen');
const mainScreen = document.getElementById('main-screen');
const dots = document.querySelectorAll('.passcode-dots .dot');
const passcodeError = document.getElementById('passcode-error');
const numpad = document.querySelectorAll('.num-btn[data-num]');
const deleteBtn = document.querySelector('.num-btn[data-action="delete"]');

let passcodeInput = '';

function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.remove('filled', 'wrong');
    if (i < passcodeInput.length) dot.classList.add('filled');
  });
}

function checkPasscode() {
  if (passcodeInput === PASSCODE) {
    lockScreen.classList.remove('active');
    mainScreen.classList.add('active', 'main-screen-enter');
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

numpad.forEach(btn => {
  btn.addEventListener('click', () => {
    if (passcodeInput.length < 4) {
      passcodeInput += btn.dataset.num;
      updateDots();
      if (passcodeInput.length === 4) checkPasscode();
    }
  });
});

if (deleteBtn) {
  deleteBtn.addEventListener('click', () => {
    passcodeInput = passcodeInput.slice(0, -1);
    updateDots();
    passcodeError.classList.remove('show');
  });
}

// ========== Modal chung ==========
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    if (modal) modal.classList.remove('active');
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
});

// ========== Cards ==========
const cardMusic = document.getElementById('card-music');
const cardLetter = document.getElementById('card-letter');
const cardPhotos = document.getElementById('card-photos');
const cardGift = document.getElementById('card-gift');

if (cardMusic) {
  cardMusic.addEventListener('click', () => {
    openModal('modal-music');
  });
}

if (cardLetter) {
  cardLetter.addEventListener('click', () => openModal('modal-letter'));
}

// ========== Ảnh (từ mảng PHOTO_FILES trong index.html) ==========
const photoSlideTop = document.getElementById('photo-slide-top');
const photoSlideBottom = document.getElementById('photo-slide-bottom');
const photoViewModal = document.getElementById('modal-photo-view');
const photoFull = document.getElementById('photo-full');

function buildPhotos() {
  if (!photoSlideTop || !photoSlideBottom) return;

  const files = Array.isArray(window.PHOTO_FILES) ? window.PHOTO_FILES : [];
  const urls = files.map(f => (f.startsWith('images/') ? f : 'images/' + f));
  if (!urls.length) return;

  const createImg = (url) => {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Ảnh';
    img.loading = 'lazy';
    img.addEventListener('click', () => {
      if (photoFull && photoViewModal) {
        photoFull.src = url;
        photoViewModal.classList.add('active');
      }
    });
    return img;
  };

  photoSlideTop.innerHTML = '';
  photoSlideBottom.innerHTML = '';

  const topSet1 = urls.map(createImg);
  const topSet2 = urls.map(createImg);
  const bottomSet1 = urls.map(createImg);
  const bottomSet2 = urls.map(createImg);

  topSet1.forEach(el => photoSlideTop.appendChild(el));
  topSet2.forEach(el => photoSlideTop.appendChild(el));
  [...bottomSet1].reverse().forEach(el => photoSlideBottom.appendChild(el));
  [...bottomSet2].reverse().forEach(el => photoSlideBottom.appendChild(el));
}

if (cardPhotos) {
  cardPhotos.addEventListener('click', () => {
    buildPhotos();
    openModal('modal-photos');
  });
}

// ========== Quà (hoa + trái tim rơi) ==========
const flowerContainer = document.getElementById('flower-container');
const fallingHearts = document.getElementById('falling-hearts');

function showFlower() {
  if (!flowerContainer) return;
  flowerContainer.innerHTML = '<div class="flower-emoji">🌸</div>';
}

function startFallingHearts() {
  if (!fallingHearts) return;
  fallingHearts.innerHTML = '';

  const createItem = () => {
    const el = document.createElement('div');
    el.className = 'falling-item';
    el.textContent = GIFT_MESSAGES[Math.floor(Math.random() * GIFT_MESSAGES.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = (4 + Math.random() * 4) + 's';
    fallingHearts.appendChild(el);
    setTimeout(() => el.remove(), 10000);
  };

  for (let i = 0; i < 20; i += 1) {
    setTimeout(createItem, i * 300);
  }
}

if (cardGift) {
  cardGift.addEventListener('click', () => {
    openModal('modal-gift');
    showFlower();
    startFallingHearts();
  });
}