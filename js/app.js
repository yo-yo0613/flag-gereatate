/**
 * 社團海報生成器 - 北科健美健身社 (NTUT BBFC) 核心邏輯
 */

const b64Logo = (typeof DEFAULT_ASSETS !== 'undefined') ? DEFAULT_ASSETS.logo : 'assets/ntut_logo.png';
const b64Qr = (typeof DEFAULT_ASSETS !== 'undefined') ? DEFAULT_ASSETS.igQr : 'assets/ig_qr.png';
const b64Photo = (typeof DEFAULT_ASSETS !== 'undefined') ? DEFAULT_ASSETS.clubPhoto : 'assets/club_photo1.jpg';

const defaultData = {
  theme: 'theme-sports',
  size: 'size-a4',
  exportScale: 3, // 300 DPI 印刷級
  
  // 1. 社團資料
  clubName: '北科健美健身社',
  clubSubtitle: 'NTUT Bodybuilding & Fitness Club (NTUT BBFC)',
  logoText: '🏋️‍♂️',
  logoImage: b64Logo,
  instagram: '@NTUT_BBFC',
  facebook: '北科健美健身社 NTUT BBFC',
  lineId: 'NTUT BBFC 社群',

  // 2. 新生茶會
  eventTitle: '116學年度 健美社新生茶會＆社課體驗',
  eventTagline: '★ NTUT BBFC WELCOME PARTY & TRIAL ★',
  eventTheme: '我們不只練大肌肌，生活也超精采！',
  eventDate: '9 月末（確切日期鎖定 IG 最新公告！）',
  eventLocation: '學校健身房／社團辦公室',
  eventTarget: '全校新生、轉學生及想打造體態的每一位夥伴',
  highlights: [
    '零基礎器材安全操作指南',
    '新手增肌減脂飲食秘訣',
    '學長姐手把手陪伴帶練',
    '打破去健身房的尷尬感'
  ],

  // 3. 活動照片 (社員熱血秀肌肉大合照)
  photoUrl: b64Photo,
  photoCaption: '【日常帶練】我們不只練大肌肌，生活也超精采！',

  // 4. 吸睛好康標語
  sloganIcon: '🧋',
  sloganMain: '打卡追蹤免費拿！麥香奶茶 ＆ 高蛋白補給等你領！',
  sloganSub: '★ 只要動動手指追蹤 IG，能量補給直接送，先補營養再練線條！ ★',

  // 5. 握力器挑戰專區
  enableGripChallenge: true,
  gripTitle: '【大力士握力大挑戰 ⚡ 測測你的爆發力！】',
  gripDesc: '凡現場挑戰握力器，不限成績直接幫你蓋社博集章！達成門檻再加碼送小禮物／高蛋白補給！',
  gripTiers: [
    { tier: '🦍 金剛神力級（男 > 50kg / 女 > 30kg）', prize: '榮登健美社榮譽巨巨，小點心任選！' },
    { tier: '🐣 潛力新手級（只要敢握就給獎）', prize: '社博集章直接蓋，能量點心帶走！' },
    { tier: '🔥 隱藏進化獎（加入我們一起變強）', prize: '免費享學長姐新手指導帶練一次！' }
  ],

  // 6. QR Code 與行動呼籲
  qrText: 'https://instagram.com/NTUT_BBFC',
  qrLabel: '追蹤 IG 鎖定最新消息',
  customQrImage: b64Qr,
  actionBadge: '社博限定・打卡就送',
  actionTitle: '立即追蹤官方 IG：@NTUT_BBFC！',
  actionDesc: '出示追蹤畫面現場領取麥香奶茶或高蛋白補給，挑戰握力器再拿好禮！'
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
    'input-instagram': 'instagram',
    'input-lineId': 'lineId',
    'input-eventTitle': 'eventTitle',
    'input-eventTagline': 'eventTagline',
    'input-eventTheme': 'eventTheme',
    'input-eventDate': 'eventDate',
    'input-eventLocation': 'eventLocation',
    'input-eventTarget': 'eventTarget',
    'input-caption-0': 'photoCaption',
    'input-sloganIcon': 'sloganIcon',
    'input-sloganMain': 'sloganMain',
    'input-sloganSub': 'sloganSub',
    'input-gripTitle': 'gripTitle',
    'input-gripDesc': 'gripDesc',
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
          saveState();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const photoInput = document.getElementById('upload-photo-0');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.photoUrl = ev.target.result;
          updatePosterDOM();
          saveState();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const qrFileInput = document.getElementById('upload-qr');
  if (qrFileInput) {
    qrFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.customQrImage = ev.target.result;
          updatePosterDOM();
          saveState();
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function updatePosterDOM() {
  poster.className = `poster ${state.theme} ${state.size}`;

  // 社團
  document.getElementById('p-clubName').textContent = state.clubName;
  document.getElementById('p-clubSubtitle').textContent = state.clubSubtitle;

  const logoContainer = document.getElementById('p-logo');
  if (state.logoImage) {
    logoContainer.innerHTML = `<img src="${state.logoImage}" alt="Logo">`;
  } else {
    logoContainer.innerHTML = `<span>${state.logoText || '🏋️‍♂️'}</span>`;
  }

  document.getElementById('p-instagram').textContent = `📸 ${state.instagram}`;
  document.getElementById('p-lineId').textContent = `💬 ${state.lineId}`;

  // 活動
  document.getElementById('p-eventTagline').textContent = state.eventTagline;
  document.getElementById('p-eventTitle').textContent = state.eventTitle;
  document.getElementById('p-eventTheme').textContent = state.eventTheme;
  document.getElementById('p-eventDate').textContent = state.eventDate;
  document.getElementById('p-eventLocation').textContent = state.eventLocation;
  document.getElementById('p-eventTarget').textContent = state.eventTarget;

  // 亮點
  const chipsContainer = document.getElementById('p-highlights');
  chipsContainer.innerHTML = state.highlights
    .map(hl => `<span class="highlight-chip">✨ ${hl}</span>`)
    .join('');

  // 照片
  const photoImg = document.getElementById('p-photoImg');
  if (photoImg && state.photoUrl) {
    photoImg.src = state.photoUrl;
  }
  document.getElementById('p-photoCaption').textContent = state.photoCaption || '';

  // 標語
  document.getElementById('p-sloganIcon').textContent = state.sloganIcon || '🧋';
  document.getElementById('p-sloganMain').textContent = state.sloganMain;
  document.getElementById('p-sloganSub').textContent = state.sloganSub;

  // 握力器
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

  // 底部
  document.getElementById('p-actionBadge').textContent = state.actionBadge;
  document.getElementById('p-actionTitle').textContent = state.actionTitle;
  document.getElementById('p-actionDesc').textContent = state.actionDesc;
  document.getElementById('p-qrLabel').textContent = state.qrLabel;

  const qrContainer = document.getElementById('p-qrCodeContainer');
  if (qrContainer && state.customQrImage) {
    qrContainer.innerHTML = `<img src="${state.customQrImage}" alt="QR Code" style="width:82px;height:82px;object-fit:contain;border-radius:4px;">`;
  }

  renderThumbPreviews();
}

function renderThumbPreviews() {
  const logoWrap = document.getElementById('logo-preview-wrap');
  if (logoWrap) {
    logoWrap.style.display = state.logoImage ? 'flex' : 'none';
    if (state.logoImage) logoWrap.querySelector('img').src = state.logoImage;
  }

  const photoWrap = document.getElementById('photo-preview-wrap-0');
  if (photoWrap) {
    photoWrap.style.display = state.photoUrl ? 'flex' : 'none';
    if (state.photoUrl) photoWrap.querySelector('img').src = state.photoUrl;
  }

  const qrWrap = document.getElementById('qr-preview-wrap');
  if (qrWrap) {
    qrWrap.style.display = state.customQrImage ? 'flex' : 'none';
    if (state.customQrImage) qrWrap.querySelector('img').src = state.customQrImage;
  }
}

window.removeLogo = function() {
  state.logoImage = '';
  updatePosterDOM();
  saveState();
};

window.removePhoto = function(idx) {
  state.photoUrl = '';
  updatePosterDOM();
  saveState();
};

window.removeCustomQr = function() {
  state.customQrImage = '';
  updatePosterDOM();
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
    if (confirm('確定要還原成北科健美健身社的預設專屬內容嗎？')) {
      localStorage.removeItem('club_poster_data');
      state = JSON.parse(JSON.stringify(defaultData));
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

// 匯出海報 PNG (嚴格限制海報本體尺寸，強制純白背景，絕無透明邊界與溢出文字！)
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

  let actualScale = state.exportScale || 3;
  if (state.size === 'size-a3' && actualScale >= 3) {
    actualScale = Math.max(actualScale, 3.5);
  } else if (state.size === 'size-b2' && actualScale >= 3) {
    actualScale = Math.max(actualScale, 4.0);
  }

  try {
    await new Promise(res => setTimeout(res, 250));

    // 嚴格只截取 poster 的寬高與起點，背景為純白實色
    const canvas = await html2canvas(poster, {
      scale: actualScale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: poster.offsetWidth,
      height: poster.offsetHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: poster.offsetWidth,
      windowHeight: poster.offsetHeight
    });

    const fileName = `${state.clubName || '北科健美健身社'}_${state.eventTitle || '海報'}_${sizeName}.png`;
    
    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) {
          fallbackDataUrl(canvas, fileName);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');
    } else {
      fallbackDataUrl(canvas, fileName);
    }
  } catch (err) {
    console.error('海報生成失敗:', err);
    alert('海報匯出失敗：' + (err.message || err));
  } finally {
    posterWrapper.style.transform = originalTransform;
    loadingOverlay.style.display = 'none';
  }
}

function fallbackDataUrl(canvas, fileName) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
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
      // 清除舊格式，使用全新升級的橫版大圖排版
      if (!parsed.photoUrl || (parsed.photos && parsed.photos.length > 0)) {
        localStorage.removeItem('club_poster_data');
        state = { ...defaultData };
        return;
      }
      state = { ...defaultData, ...parsed };
      return;
    }
  } catch (e) {
    console.warn('讀取暫存失敗');
  }
  state = { ...defaultData };
}