(function() {
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const swatches = Array.from(document.querySelectorAll('.swatch'));
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const brushLabel = document.getElementById('brushLabel');
    const increaseBrush = document.getElementById('increaseBrush');
    const decreaseBrush = document.getElementById('decreaseBrush');
    const eraserBtn = document.getElementById('eraserBtn');

    let BRUSH = 6; // товщина пензля
    let ERASER = 20; // товщина гумки
    const MIN_SIZE = 1;
    const MAX_SIZE = 50;
    let drawing = false;
    let lastX = 0, lastY = 0;
    let color = '#000000';
    let eraserMode = false;

    function updateLabel() {
      if (eraserMode) {
        brushLabel.innerHTML = `Товщина гумки: <b>${ERASER} px</b>`;
        ctx.lineWidth = ERASER;
      } else {
        brushLabel.innerHTML = `Товщина пензля: <b>${BRUSH} px</b>`;
        ctx.lineWidth = BRUSH;
      }
    }

    increaseBrush.addEventListener('click', () => {
      if (eraserMode) {
        if (ERASER < MAX_SIZE) ERASER++;
      } else {
        if (BRUSH < MAX_SIZE) BRUSH++;
      }
      updateLabel();
    });

    decreaseBrush.addEventListener('click', () => {
      if (eraserMode) {
        if (ERASER > MIN_SIZE) ERASER--;
      } else {
        if (BRUSH > MIN_SIZE) BRUSH--;
      }
      updateLabel();
    });

    eraserBtn.addEventListener('click', () => {
      eraserMode = !eraserMode;
      eraserBtn.classList.toggle('active', eraserMode);
      updateLabel();
    });

    function setDeviceSize(preserve = true) {
      let snapshot = null;
      if (preserve && canvas.width > 0 && canvas.height > 0) {
        snapshot = document.createElement('canvas');
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        snapshot.getContext('2d').drawImage(canvas, 0, 0);
      }

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      updateLabel();

      if (snapshot) {
        ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, rect.width, rect.height);
      } else {
        ctx.fillStyle = '#ffffff'; // білий фон
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    }

    function getPos(evt) {
      const rect = canvas.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function start(e) {
      e.preventDefault();
      drawing = true;
      const p = getPos(e);
      lastX = p.x; lastY = p.y;
    }

    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      const p = getPos(e);
      ctx.strokeStyle = eraserMode ? '#ffffff' : color;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastX = p.x; lastY = p.y;
    }

    function end(e) {
      if (!drawing) return;
      e.preventDefault();
      drawing = false;
    }

    canvas.addEventListener('mousedown', start, { passive: false });
    window.addEventListener('mousemove', move, { passive: false });
    window.addEventListener('mouseup', end, { passive: false });

    canvas.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end, { passive: false });

    swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        swatches.forEach(b => b.setAttribute('aria-current','false'));
        btn.setAttribute('aria-current','true');
        color = btn.dataset.color;
        eraserMode = false;
        eraserBtn.classList.remove('active');
        updateLabel();
      });
    });

    clearBtn.addEventListener('click', () => {
      ctx.fillStyle = '#ffffff'; // білий фон
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    saveBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'malunok.png';
      link.href = canvas.toDataURL();
      link.click();
    });

    const ro = new ResizeObserver(() => setDeviceSize(true));
    ro.observe(document.querySelector('.stage'));
    setDeviceSize(false);

    document.addEventListener('gesturestart', e => e.preventDefault());
  })();
  