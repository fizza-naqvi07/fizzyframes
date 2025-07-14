let currentPhoto = 0;
const totalPhotos = 3;
const photos = [];
const camera = document.getElementById('camera');
const snapBtn = document.getElementById('snap-btn');
const photoCount = document.getElementById('photo-count');
const captionInput = document.getElementById('caption-input');
const generateBtn = document.getElementById('generate-btn');
const polaroidOutput = document.getElementById('polaroid-output');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');
const canvas = document.getElementById('canvas');

document.getElementById('start-btn').onclick = async () => {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('camera-screen').style.display = 'flex';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;
  } catch (err) {
    alert("Camera access denied or not available.");
    console.error(err);
  }
};

document.querySelectorAll('#filter-buttons button').forEach(btn => {
  btn.onclick = () => {
    camera.style.filter = btn.dataset.filter;
  };
});

// Snap photo
snapBtn.onclick = () => {
  const flash = document.getElementById('flash');
  flash.style.opacity = '1';
  setTimeout(() => { flash.style.opacity = '0'; }, 150);

  const context = canvas.getContext('2d');
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;
  context.filter = camera.style.filter;
  context.drawImage(camera, 0, 0, canvas.width, canvas.height);
  photos.push(canvas.toDataURL());

  currentPhoto++;
  if (currentPhoto < totalPhotos) {
    photoCount.textContent = `Photo ${currentPhoto + 1} of ${totalPhotos}`;
  } else {
    document.getElementById('camera-screen').style.display = 'none';
    document.getElementById('reel-screen').style.display = 'flex';
  }
};

generateBtn.onclick = () => {
  const caption = captionInput.value;
  const ctx = canvas.getContext('2d');

  const maxWidth = 400;
  const width = Math.min(maxWidth, window.innerWidth - 40);
  const imageWidth = width - 50;
  const imageHeight = 240;
  const spacing = 20;
  const height = photos.length * (imageHeight + spacing) + 80;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#fefaf4';
  ctx.fillRect(0, 0, width, height);

  photos.forEach((photo, i) => {
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      const x = (width - imageWidth) / 2;
      const y = i * (imageHeight + spacing) + 20;
      ctx.drawImage(img, x, y, imageWidth, imageHeight);
      ctx.strokeStyle = '#5a3b2b';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, imageWidth, imageHeight);

      if (i === photos.length - 1) {
        ctx.font = 'bold 34px "Dancing Script", cursive';
        ctx.fillStyle = '#5a3b2b';
        ctx.textAlign = 'center';
        ctx.fillText(caption, width / 2, height - 30);

        polaroidOutput.src = canvas.toDataURL();
        document.getElementById('reel-screen').style.display = 'none';
        document.getElementById('result-screen').style.display = 'flex';
        downloadBtn.style.display = 'inline-block';
        shareBtn.style.display = 'inline-block';
      }
    };
  });
};

downloadBtn.onclick = () => {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'fizzyframes-polaroid.png';
  a.click();
};

shareBtn.onclick = async () => {
  const blob = await (await fetch(canvas.toDataURL())).blob();
  const file = new File([blob], 'fizzyframes-polaroid.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({
      files: [file],
      title: 'FizzyFrames Polaroid!',
      text: 'Check out the cutest polaroid!💖',
    });
  } else {
    alert('Sharing not supported on this browser.');
  }
};

