/**
 * 社團海報生成器 - 核心互動邏輯
 */

const defaultData = {
  theme: 'theme-sports',
  size: 'size-a4',
  exportScale: 3, // 預設 3x (達到 300 DPI 級印刷畫質)
  
  // 1. 社團基本資料
  clubName: '極限體適能與攀岩社',
  clubSubtitle: 'LIMITLESS FITNESS & CLIMBING CLUB',
  logoText: '🧗‍♂️',
  logoImage: '',
  instagram: '@limitless_fit_club',
  facebook: '極限體適能社 NTU',
  lineId: '@fit_club2026',

  // 2. 新生茶會資訊
  eventTitle: '2026 新生體驗茶會',
  eventTagline: '★ WELCOME PARTY & RECRUITMENT ★',
  eventTheme: '打破舒適圈！找到志同道合的熱血夥伴',
  eventDate: '2026.09.24 (四) 18:30 入場',
  eventLocation: '活動中心 3 樓 多功能韻律教室',
  eventTarget: '全校新生、轉學生及熱愛運動的夥伴',
  highlights: ['熱血社團介紹', '專業器材初體驗', '學長姐經驗分享', '迎新交流破冰'],

  // 3. 吸睛標語 (小點心/好康福利)
  sloganIcon: '🍕',
  sloganMain: '現場備有精緻小點心、手搖飲免費享用！',
  sloganSub: '★ 早鳥前 30 名報到，加碼送社團特製運動水壺 ★',

  // 4. 握力器挑戰專區
  enableGripChallenge: true,
  gripTitle: '🔥 攤位限定：握力極限大挑戰！',
  gripDesc: '現場握一下，挑戰全校最強神力！當場測驗即可累積積分抽大獎。',
  gripTiers: [
    { tier: '🏆 猛獸霸王 (男 55kg+ / 女 38kg+)', prize: '社團限定排汗衫 + 能量棒' },
    { tier: '🥈 實力爆發 (男 45kg+ / 女 30kg+)', prize: '超商百元禮券 / 運動毛巾' },
    { tier: '🎁 挑戰有禮 (人人有獎)', prize: '美味小點心 + 運動飲料' }
  ],

  // 5. 照片展示
  photoLayout: 'layout-double',
  photos: [
    {
      url: 'assets/photo1.svg',
      caption: '日常社課重訓指導'
    },
    {
      url: 'assets/photo2.svg',
      caption: '戶外攀岩抱石挑戰'
    },
    {
      url: 'assets/photo3.svg',
      caption: '歡樂熱血團練'
    }
  ],

  // 6. QR Code 與行動呼籲
  qrText: 'https://forms.gle/sample-club-signup-2026',
  qrLabel: '掃描立即報名茶會',
  customQrImage: '',
  actionBadge: '報名免費・名額有限',
  actionTitle: '立即掃碼報名茶會！',
  actionDesc: '填寫表單預留座位與點心份數，現場憑確認信領取迎新好禮！'
};

let state = { ...defaultData };
let currentZoom = 0.85;

const poster = document.getElementById('posterCanvas');
const posterWrapper = document.getElementById('posterWrapper');
const loadingOverlay = document.getElementById('loadingOverlay');
const zoomLevelText = document.getElementById('zoomLevelText');

document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  initFormBindings();
  updatePosterDOM();
  generateQRCode();
  autoFitZoom();
  setupEventListeners();
});

function autoFitZoom() {
  const container = document.querySelector('.preview-area');
  if (!container || !poster) return;
  const availWidth = container.clientWidth - 80;
  const availHeight = container.clientHeight - 130;
  const posterWidth = poster.offsetWidth || 800;
  const posterHeight = poster.offsetHeight || 1131;

  const scaleW = availWidth / posterWidth;
  const scaleH = availHeight / posterHeight;
  const targetZoom = Math.min(scaleW, scaleH, 1.0);
  setZoom(Math.max(0.35, Math.min(targetZoom, 1.1)));
}

function setZoom(val) {
  currentZoom = Math.round(val * 100) / 100;
  if (posterWrapper) {
    posterWrapper.style.transform = `scale(${currentZoom})`;
  }
  if (zoomLevelText) {
    zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

function initFormBindings() {
  const fieldMap = {
    'input-clubName': 'clubName',
    'input-clubSubtitle': 'clubSubtitle',
    'input-logoText': 'logoText',
    'input-instagram': 'instagram',
    'input-facebook': 'facebook',
    'input-lineId': 'lineId',
    'input-eventTitle': 'eventTitle',
    'input-eventTagline': 'eventTagline',
    'input-eventTheme': 'eventTheme',
    'input-eventDate': 'eventDate',
    'input-eventLocation': 'eventLocation',
    'input-eventTarget': 'eventTarget',
    'input-sloganIcon': 'sloganIcon',
    'input-sloganMain': 'sloganMain',
    'input-sloganSub': 'sloganSub',
    'input-gripTitle': 'gripTitle',
    'input-gripDesc': 'gripDesc',
    'input-qrText': 'qrText',
    'input-qrLabel': 'qrLabel',
    'input-actionBadge': 'actionBadge',
    'input-actionTitle': 'actionTitle',
    'input-actionDesc': 'actionDesc'
  };

  for (const [id, key] of Object.entries(fieldMap)) {
    const el = document.getElementById(id);
    if (el) {
      el.value = state[key] || '';
      el.addEventListener('input', (e) => {
        state[key] = e.target.value;
        updatePosterDOM();
        if (key === 'qrText') generateQRCode();
        saveState();
      });
    }
  }

  const hlInput = document.getElementById('input-highlights');
  if (hlInput) {
    hlInput.value = state.highlights.join(', ');
    hlInput.addEventListener('input', (e) => {
      state.highlights = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
      updatePosterDOM();
      saveState();
    });
  }

  const gripToggle = document.getElementById('input-enableGrip');
  if (gripToggle) {
    gripToggle.checked = state.enableGripChallenge;
    gripToggle.addEventListener('change', (e) => {
      state.enableGripChallenge = e.target.checked;
      updatePosterDOM();
      saveState();
    });
  }

  for (let i = 0; i < 3; i++) {
    const tierInput = document.getElementById(`input-gripTier-${i}`);
    const prizeInput = document.getElementById(`input-gripPrize-${i}`);
    if (tierInput && prizeInput) {
      tierInput.value = state.gripTiers[i]?.tier || '';
      prizeInput.value = state.gripTiers[i]?.prize || '';
      
      const onTierChange = () => {
        state.gripTiers[i] = {
          tier: tierInput.value,
          prize: prizeInput.value
        };
        updatePosterDOM();
        saveState();
      };
      tierInput.addEventListener('input', onTierChange);
      prizeInput.addEventListener('input', onTierChange);
    }
  }

  const themeSelect = document.getElementById('select-theme');
  if (themeSelect) {
    themeSelect.value = state.theme;
    themeSelect.addEventListener('change', (e) => {
      state.theme = e.target.value;
      updatePosterDOM();
      saveState();
    });
  }

  const sizeSelect = document.getElementById('select-size');
  if (sizeSelect) {
    sizeSelect.value = state.size;
    sizeSelect.addEventListener('change', (e) => {
      state.size = e.target.value;
      updatePosterDOM();
      autoFitZoom();
      saveState();
    });
  }

  const photoLayoutSelect = document.getElementById('select-photoLayout');
  if (photoLayoutSelect) {
    photoLayoutSelect.value = state.photoLayout;
    photoLayoutSelect.addEventListener('change', (e) => {
      state.photoLayout = e.target.value;
      updatePosterDOM();
      saveState();
    });
  }

  setupFileUploads();
}

function setupFileUploads() {
  const logoFileInput = document.getElementById('upload-logo');
  if (logoFileInput) {
    logoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.logoImage = ev.target.result;
          updatePosterDOM();
          renderLogoPreview();
          saveState();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  [0, 1, 2].forEach(idx => {
    const fileInput = document.getElementById(`upload-photo-${idx}`);
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (!state.photos[idx]) state.photos[idx] = { url: '', caption: '' };
            state.photos[idx].url = ev.target.result;
            updatePosterDOM();
            renderPhotoPreviews();
            saveState();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const captionInput = document.getElementById(`input-caption-${idx}`);
    if (captionInput) {
      captionInput.value = state.photos[idx]?.caption || '';
      captionInput.addEventListener('input', (e) => {
        if (!state.photos[idx]) state.photos[idx] = { url: '', caption: '' };
        state.photos[idx].caption = e.target.value;
        updatePosterDOM();
        saveState();
      });
    }
  });

  const qrFileInput = document.getElementById('upload-qr');
  if (qrFileInput) {
    qrFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.customQrImage = ev.target.result;
          renderQRCodeElement();
          renderQrPreview();
          saveState();
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function updatePosterDOM() {
  poster.className = `poster ${state.theme} ${state.size}`;

  document.getElementById('p-clubName').textContent = state.clubName;
  document.getElementById('p-clubSubtitle').textContent = state.clubSubtitle;

  const logoContainer = document.getElementById('p-logo');
  if (state.logoImage) {
    logoContainer.innerHTML = `<img src="${state.logoImage}" alt="Logo">`;
  } else {
    logoContainer.innerHTML = `<span>${state.logoText || '🎯'}</span>`;
  }

  const igEl = document.getElementById('p-instagram');
  const fbEl = document.getElementById('p-facebook');
  const lineEl = document.getElementById('p-lineId');

  igEl.style.display = state.instagram ? 'inline-flex' : 'none';
  igEl.innerHTML = `<span style="color:#e1306c">📸</span> ${state.instagram}`;

  fbEl.style.display = state.facebook ? 'inline-flex' : 'none';
  fbEl.innerHTML = `<span style="color:#1877f2">👥</span> ${state.facebook}`;

  lineEl.style.display = state.lineId ? 'inline-flex' : 'none';
  lineEl.innerHTML = `<span style="color:#06c755">💬</span> ${state.lineId}`;

  document.getElementById('p-eventTagline').textContent = state.eventTagline;
  document.getElementById('p-eventTitle').textContent = state.eventTitle;
  document.getElementById('p-eventTheme').textContent = state.eventTheme;

  document.getElementById('p-eventDate').textContent = state.eventDate;
  document.getElementById('p-eventLocation').textContent = state.eventLocation;
  document.getElementById('p-eventTarget').textContent = state.eventTarget;

  const chipsContainer = document.getElementById('p-highlights');
  chipsContainer.innerHTML = state.highlights
    .map(hl => `<span class="highlight-chip">✨ ${hl}</span>`)
    .join('');

  document.getElementById('p-sloganIcon').textContent = state.sloganIcon || '🎉';
  document.getElementById('p-sloganMain').textContent = state.sloganMain;
  document.getElementById('p-sloganSub').textContent = state.sloganSub;

  const gripSection = document.getElementById('p-gripChallenge');
  if (state.enableGripChallenge) {
    gripSection.style.display = 'flex';
    document.getElementById('p-gripTitle').textContent = state.gripTitle;
    document.getElementById('p-gripDesc').textContent = state.gripDesc;

    const tierListEl = document.getElementById('p-gripTierList');
    tierListEl.innerHTML = state.gripTiers.map(t => `
      <div class="grip-tier">
        <span class="tier-condition">${t.tier}</span>
        <span class="tier-prize">${t.prize}</span>
      </div>
    `).join('');
  } else {
    gripSection.style.display = 'none';
  }

  renderPosterPhotos();

  document.getElementById('p-actionBadge').textContent = state.actionBadge;
  document.getElementById('p-actionTitle').textContent = state.actionTitle;
  document.getElementById('p-actionDesc').textContent = state.actionDesc;
  document.getElementById('p-qrLabel').textContent = state.qrLabel;

  renderQRCodeElement();
}

function renderPosterPhotos() {
  const gallery = document.getElementById('p-photoGallery');
  gallery.className = `photo-gallery ${state.photoLayout}`;

  const validPhotos = state.photos.filter(p => p && p.url);

  if (state.photoLayout === 'layout-single') {
    const p1 = validPhotos[0] || { url: '', caption: '' };
    gallery.innerHTML = `
      <div class="poster-photo-img-wrap">
        ${p1.url ? `<img src="${p1.url}" alt="活動照" crossorigin="anonymous">` : '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#64748b;">暫無照片</div>'}
        ${p1.caption ? `<div class="photo-caption">${p1.caption}</div>` : ''}
      </div>
    `;
  } else if (state.photoLayout === 'layout-double') {
    const p1 = validPhotos[0] || { url: '', caption: '' };
    const p2 = validPhotos[1] || validPhotos[0] || { url: '', caption: '' };
    gallery.innerHTML = `
      <div class="poster-photo-img-wrap">
        ${p1.url ? `<img src="${p1.url}" alt="活動照 1" crossorigin="anonymous">` : '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#64748b;">暫無照片</div>'}
        ${p1.caption ? `<div class="photo-caption">${p1.caption}</div>` : ''}
      </div>
      <div class="poster-photo-img-wrap">
        ${p2.url ? `<img src="${p2.url}" alt="活動照 2" crossorigin="anonymous">` : '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#64748b;">暫無照片</div>'}
        ${p2.caption ? `<div class="photo-caption">${p2.caption}</div>` : ''}
      </div>
    `;
  } else {
    const p1 = validPhotos[0] || { url: '', caption: '' };
    const p2 = validPhotos[1] || { url: '', caption: '' };
    const p3 = validPhotos[2] || { url: '', caption: '' };
    gallery.innerHTML = `
      <div class="poster-photo-img-wrap">
        ${p1.url ? `<img src="${p1.url}" alt="活動焦點照" crossorigin="anonymous">` : '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#64748b;">焦點照片</div>'}
        ${p1.caption ? `<div class="photo-caption">${p1.caption}</div>` : ''}
      </div>
      <div class="gallery-sub-col">
        <div class="poster-photo-img-wrap">
          ${p2.url ? `<img src="${p2.url}" alt="活動照 2" crossorigin="anonymous">` : '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#64748b;">照片 2</div>'}
          ${p2.caption ? `<div class="photo-caption">${p2.caption}</div>` : ''}
        </div>
        <div class="poster-photo-img-wrap">
          ${p3.url ? `<img src="${p3.url}" alt="活動照 3" crossorigin="anonymous">` : '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#64748b;">照片 3</div>'}
          ${p3.caption ? `<div class="photo-caption">${p3.caption}</div>` : ''}
        </div>
      </div>
    `;
  }
}

let qrCodeInstance = null;
function generateQRCode() {
  const container = document.getElementById('p-qrCodeContainer');
  if (!container) return;

  if (state.customQrImage) {
    container.innerHTML = `<img src="${state.customQrImage}" alt="QR Code" style="width:90px;height:90px;object-fit:contain;">`;
    return;
  }

  container.innerHTML = '';
  if (window.QRCode && state.qrText) {
    try {
      qrCodeInstance = new QRCode(container, {
        text: state.qrText,
        width: 180,
        height: 180,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch (e) {
      console.error('QRCode generation failed', e);
      container.innerHTML = '<span style="font-size:10px;color:#94a3b8;">QR Code</span>';
    }
  }
}

function renderQRCodeElement() {
  if (state.customQrImage) {
    const container = document.getElementById('p-qrCodeContainer');
    if (container) {
      container.innerHTML = `<img src="${state.customQrImage}" alt="自訂 QR Code" style="width:90px;height:90px;object-fit:contain;">`;
    }
  } else {
    generateQRCode();
  }
}

function renderLogoPreview() {
  const wrap = document.getElementById('logo-preview-wrap');
  if (!wrap) return;
  if (state.logoImage) {
    wrap.style.display = 'flex';
    wrap.querySelector('img').src = state.logoImage;
  } else {
    wrap.style.display = 'none';
  }
}

function renderPhotoPreviews() {
  [0, 1, 2].forEach(idx => {
    const wrap = document.getElementById(`photo-preview-wrap-${idx}`);
    if (wrap) {
      if (state.photos[idx]?.url) {
        wrap.style.display = 'flex';
        wrap.querySelector('img').src = state.photos[idx].url;
      } else {
        wrap.style.display = 'none';
      }
    }
  });
}

function renderQrPreview() {
  const wrap = document.getElementById('qr-preview-wrap');
  if (!wrap) return;
  if (state.customQrImage) {
    wrap.style.display = 'flex';
    wrap.querySelector('img').src = state.customQrImage;
  } else {
    wrap.style.display = 'none';
  }
}

window.removeLogo = function() {
  state.logoImage = '';
  renderLogoPreview();
  updatePosterDOM();
  saveState();
};

window.removePhoto = function(idx) {
  if (state.photos[idx]) {
    state.photos[idx].url = '';
  }
  renderPhotoPreviews();
  updatePosterDOM();
  saveState();
};

window.removeCustomQr = function() {
  state.customQrImage = '';
  renderQrPreview();
  updatePosterDOM();
  generateQRCode();
  saveState();
};

function setupEventListeners() {
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => setZoom(currentZoom + 0.1));
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => setZoom(Math.max(0.3, currentZoom - 0.1)));
  document.getElementById('btn-zoom-fit')?.addEventListener('click', autoFitZoom);

  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('collapsed');
    });
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('確定要還原成預設範例內容嗎？目前的編輯將會被覆蓋。')) {
      state = JSON.parse(JSON.stringify(defaultData));
      localStorage.removeItem('club_poster_data');
      location.reload();
    }
  });

  const scaleSelect = document.getElementById('select-scale');
  if (scaleSelect) {
    scaleSelect.addEventListener('change', (e) => {
      state.exportScale = parseInt(e.target.value, 10) || 3;
    });
  }

  document.getElementById('btn-export')?.addEventListener('click', exportPosterPNG);

  window.addEventListener('resize', () => {
    if (currentZoom <= 1.0) autoFitZoom();
  });
}

// 匯出海報 PNG (針對 A4, A3, B2, 限動與貼文尺寸優化)
async function exportPosterPNG() {
  if (!window.html2canvas) {
    alert('圖片渲染庫尚未載入完成，請稍候重試！');
    return;
  }

  loadingOverlay.style.display = 'flex';
  const loadingText = document.getElementById('loadingText');
  const sizeName = state.size.replace('size-', '').toUpperCase();
  loadingText.textContent = `正在為您渲染高解析度 (${sizeName}) 海報，請稍候...`;

  const originalTransform = posterWrapper.style.transform;
  posterWrapper.style.transform = 'none';

  // 尺寸畫質倍率優化：確保 A4, A3, B2 印刷時達到 300 DPI 級別
  let actualScale = state.exportScale || 3;
  if (state.size === 'size-a3' && actualScale >= 3) {
    actualScale = Math.max(actualScale, 3.5);
  } else if (state.size === 'size-b2' && actualScale >= 3) {
    actualScale = Math.max(actualScale, 4.0);
  }

  try {
    await new Promise(res => setTimeout(res, 300));

    const canvas = await html2canvas(poster, {
      scale: actualScale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: poster.scrollWidth,
      windowHeight: poster.scrollHeight
    });

    const fileName = `${state.clubName || '社團'}_${state.eventTitle || '海報'}_${sizeName}.png`;
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } catch (err) {
    console.error('海報生成失敗:', err);
    alert('海報匯出時發生問題，可能是外部照片存在跨域限制。請嘗試上傳本機照片後再下載！');
  } finally {
    posterWrapper.style.transform = originalTransform;
    loadingOverlay.style.display = 'none';
  }
}

function saveState() {
  try {
    localStorage.setItem('club_poster_data', JSON.stringify(state));
  } catch (e) {
    console.warn('LocalStorage 儲存失敗:', e);
  }
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem('club_poster_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.warn('讀取暫存失敗，使用預設值');
  }
}