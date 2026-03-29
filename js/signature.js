// ============================================================
//  SIGNATURE.JS — Digital signature pad
// ============================================================

let sigCanvas, sigCtx, isDrawing = false, sigHasData = false;

function initSignaturePad() {
  sigCanvas = document.getElementById('sig-canvas');
  if (!sigCtx) sigCtx = sigCanvas.getContext('2d');

  sigCanvas.width  = sigCanvas.offsetWidth;
  sigCanvas.height = 120;

  sigCtx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light' ? '#0f1420' : '#eceef5';
  sigCtx.lineWidth   = 2;
  sigCtx.lineCap     = 'round';
  sigCtx.lineJoin    = 'round';

  // Mouse events
  sigCanvas.addEventListener('mousedown',  startDraw);
  sigCanvas.addEventListener('mousemove',  draw);
  sigCanvas.addEventListener('mouseup',    endDraw);
  sigCanvas.addEventListener('mouseleave', endDraw);

  // Touch events
  sigCanvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e.touches[0]); });
  sigCanvas.addEventListener('touchmove',  e => { e.preventDefault(); draw(e.touches[0]); });
  sigCanvas.addEventListener('touchend',   endDraw);
}

function getPos(e) {
  const rect = sigCanvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function startDraw(e) {
  isDrawing = true;
  const pos = getPos(e);
  sigCtx.beginPath();
  sigCtx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!isDrawing) return;
  const pos = getPos(e);
  sigCtx.lineTo(pos.x, pos.y);
  sigCtx.stroke();
  sigHasData = true;
}

function endDraw() { isDrawing = false; }

function clearSignature() {
  if (sigCtx) {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    sigHasData = false;
  }
}

function getSignatureDataURL() {
  if (!sigHasData || !sigCanvas) return null;
  return sigCanvas.toDataURL('image/png');
}
