const themeBtn = document.getElementById('themeBtn');
const icoSun = document.getElementById('icoSun');
const icoMoon = document.getElementById('icoMoon');

// Theme toggling
themeBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  
  if(newTheme === 'dark'){
    icoSun.style.display = 'none';
    icoMoon.style.display = 'block';
  } else {
    icoSun.style.display = 'block';
    icoMoon.style.display = 'none';
  }
});

// UI Elements
const modeBg = document.getElementById('modeBg');
const tabFIK = document.getElementById('tabFIK');
const tabTI = document.getElementById('tabTI');
const tabSI = document.getElementById('tabSI');
const tabVideo = document.getElementById('tabVideo');

const loadingFrame = document.getElementById('loadingFrame');
const photoControls = document.getElementById('photoControls');
const editorSection = document.getElementById('editorSection');
const videoSection = document.getElementById('videoSection');

// Canvas Setup
const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');

let frameImg = null;
let photoImg = null;
let currentProdi = 'FIK'; // Default to FIK
let isPlaceholder = true;

// Photo transforms
let photoX = 0;
let photoY = 0;
let photoScale = 1;
const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');

// Dragging state
let isDragging = false;
let startX = 0;
let startY = 0;

const photoUpload = document.getElementById('photoUpload');

// Frame Paths
const frames = {
  'FIK': 'frame_fik.png',
  'TI': 'frame_ti.png',
  'SI': 'frame_si.png'
};

function loadPlaceholder() {
  const img = new Image();
  img.onload = () => {
    // Only set as placeholder if user hasn't uploaded a photo yet
    if (isPlaceholder) {
      photoImg = img;
      centerPhoto();
      draw();
    }
  };
  img.src = 'placeholder.png';
}

function selectProdi(prodi) {
  currentProdi = prodi;
  
  tabFIK.classList.remove('active');
  tabTI.classList.remove('active');
  tabSI.classList.remove('active');
  tabVideo.classList.remove('active');
  
  if(prodi === 'FIK') {
    modeBg.style.transform = 'translateX(0)';
    tabFIK.classList.add('active');
    editorSection.style.display = 'block';
    videoSection.style.display = 'none';
  } else if(prodi === 'TI') {
    modeBg.style.transform = 'translateX(100%)';
    tabTI.classList.add('active');
    editorSection.style.display = 'block';
    videoSection.style.display = 'none';
  } else if(prodi === 'SI') {
    modeBg.style.transform = 'translateX(200%)';
    tabSI.classList.add('active');
    editorSection.style.display = 'block';
    videoSection.style.display = 'none';
  } else if(prodi === 'VIDEO') {
    modeBg.style.transform = 'translateX(300%)';
    tabVideo.classList.add('active');
    editorSection.style.display = 'none';
    videoSection.style.display = 'block';
  }
  
  // Load Frame if not video
  if(prodi !== 'VIDEO') {
    loadFrame(frames[prodi]);
  }
}

tabFIK.addEventListener('click', () => selectProdi('FIK'));
tabTI.addEventListener('click', () => selectProdi('TI'));
tabSI.addEventListener('click', () => selectProdi('SI'));
tabVideo.addEventListener('click', () => selectProdi('VIDEO'));

function loadFrame(url) {
  loadingFrame.style.display = 'block';
  const img = new Image();
  img.onload = () => {
    frameImg = img;
    canvas.width = img.width;
    canvas.height = img.height;
    loadingFrame.style.display = 'none';
    if(photoImg) centerPhoto();
    draw();
  };
  img.onerror = () => {
    // If image not found, create a dummy placeholder for now
    frameImg = null;
    canvas.width = 1080;
    canvas.height = 1080;
    loadingFrame.innerText = "Bingkai belum tersedia (Akan ditambahkan nanti)";
    if(photoImg) centerPhoto();
    drawDummyFrame();
  };
  img.src = url;
}

function drawDummyFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Redraw photo first if it exists, so the placeholder frame overlays it
  if(photoImg){
    ctx.save();
    ctx.translate(photoX, photoY);
    ctx.scale(photoScale, photoScale);
    ctx.drawImage(photoImg, 0, 0);
    ctx.restore();
  }
  
  // Draw semi-transparent purple border
  ctx.lineWidth = 100;
  ctx.strokeStyle = "rgba(94, 35, 157, 0.8)";
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
  ctx.fillStyle = "rgba(94, 35, 157, 0.8)";
  ctx.font = "bold 60px sans-serif";
  ctx.textAlign = "center";
  let text = "BINGKAI FIK";
  if(currentProdi === 'TI') text = "BINGKAI TI";
  else if(currentProdi === 'SI') text = "BINGKAI SI";
  ctx.fillText(text, canvas.width/2, canvas.height/2 + 200);
}

photoUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        photoImg = img;
        isPlaceholder = false;
        photoControls.style.display = 'block';
        centerPhoto();
        draw();
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(file);
  }
});

function centerPhoto() {
  if(!photoImg) return;
  // Calculate initial scale to fit the canvas height or width
  const scaleX = canvas.width / photoImg.width;
  const scaleY = canvas.height / photoImg.height;
  photoScale = Math.max(scaleX, scaleY); // Fill area
  
  scaleSlider.value = photoScale;
  scaleValue.innerText = Math.round(photoScale * 100) + '%';
  
  photoX = (canvas.width - photoImg.width * photoScale) / 2;
  photoY = (canvas.height - photoImg.height * photoScale) / 2;
}

function draw() {
  if(!frameImg && !photoImg) {
      // Just clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
  }
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw photo
  if(photoImg){
    ctx.save();
    ctx.translate(photoX, photoY);
    ctx.scale(photoScale, photoScale);
    ctx.drawImage(photoImg, 0, 0);
    ctx.restore();
  }
  
  // Draw frame on top
  if(frameImg){
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  } else {
    drawDummyFrame(); // Draw placeholder if no real frame
  }
}

// Drag interactions for moving photo
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
  if(isDragging && photoImg) {
    // Canvas is scaled down by CSS, so we need to adjust mouse delta
    const rect = canvas.getBoundingClientRect();
    const scaleFactorX = canvas.width / rect.width;
    const scaleFactorY = canvas.height / rect.height;
    
    const dx = (e.offsetX - startX) * scaleFactorX;
    const dy = (e.offsetY - startY) * scaleFactorY;
    
    photoX += dx;
    photoY += dy;
    
    startX = e.offsetX;
    startY = e.offsetY;
    
    draw();
  }
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.touches[0].clientX - rect.left;
    startY = e.touches[0].clientY - rect.top;
}, {passive: true});

canvas.addEventListener('touchmove', (e) => {
    if(!isDragging || !photoImg) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.touches[0].clientX - rect.left;
    const currentY = e.touches[0].clientY - rect.top;
    
    const scaleFactorX = canvas.width / rect.width;
    const scaleFactorY = canvas.height / rect.height;
    
    const dx = (currentX - startX) * scaleFactorX;
    const dy = (currentY - startY) * scaleFactorY;
    
    photoX += dx;
    photoY += dy;
    
    startX = currentX;
    startY = currentY;
    
    draw();
    e.preventDefault(); // Prevent scrolling while dragging
}, {passive: false});

canvas.addEventListener('touchend', () => isDragging = false);

// Scaling
scaleSlider.addEventListener('input', (e) => {
  if(!photoImg) return;
  const newScale = parseFloat(e.target.value);
  
  // Adjust photoX and photoY so scaling happens from center roughly
  const oldWidth = photoImg.width * photoScale;
  const oldHeight = photoImg.height * photoScale;
  
  const newWidth = photoImg.width * newScale;
  const newHeight = photoImg.height * newScale;
  
  photoX -= (newWidth - oldWidth) / 2;
  photoY -= (newHeight - oldHeight) / 2;
  
  photoScale = newScale;
  scaleValue.innerText = Math.round(photoScale * 100) + '%';
  draw();
});

// Download
document.getElementById('downloadBtn').addEventListener('click', () => {
  if(!photoImg || isPlaceholder) {
    alert("Silakan upload foto terlebih dahulu!");
    return;
  }
  
  const link = document.createElement('a');
  link.download = `twibbon-${currentProdi}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Download Video Template
document.getElementById('downloadVideoBtn').addEventListener('click', () => {
  window.open("https://drive.google.com/file/d/1HBlOsGG4Nu1NOpUrS_iDlBIGXeUChbXm/view?usp=drive_link", "_blank");
});

// Initialize on page load
loadPlaceholder();
selectProdi('FIK');
