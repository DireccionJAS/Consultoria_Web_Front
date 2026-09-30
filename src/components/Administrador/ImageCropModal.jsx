import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import styles from './../../styles/ModalesServicio.module.css';

// zoom < 1 aleja más allá de "llenar el cuadro", para poder incluir la
// imagen completa (con márgenes blancos) cuando no calza en 16:9.
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;

function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7"></path></svg>;
}

function getCroppedBlob(imageSrc, cropPixels) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cropPixels.width;
      canvas.height = cropPixels.height;
      const ctx = canvas.getContext('2d');
      // Con zoom < 1 (alejado) el cuadro de recorte puede sobrepasar los
      // bordes de la imagen original — se rellena de blanco en vez de dejar
      // que el canvas quede transparente (que el JPEG exportaría en negro).
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, cropPixels.width, cropPixels.height);
      ctx.drawImage(
        img,
        cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
        0, 0, cropPixels.width, cropPixels.height
      );
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen recortada'))), 'image/jpeg', 0.92);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

// Recorte estilo Instagram/WhatsApp al subir la "Imagen principal": el admin
// arrastra y hace zoom sobre un cuadro con la MISMA proporción (16:9) que las
// tarjetas donde el servicio se muestra de verdad, para que lo que se ve al
// subir sea lo que el cliente termina viendo.
export default function ImageCropModal({ imageSrc, aspect = 16 / 9, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const onCropComplete = useCallback((_croppedArea, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcesando(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className={`${styles.scrim} ${styles.cropScrim}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className={styles.cropModal}>
        <div className={styles.cropHead}>Ajustar imagen principal</div>
        <div className={styles.cropHint}>Arrastra para mover y usa el control para hacer zoom. Aléjalo para incluir la imagen completa.</div>
        <div className={styles.cropArea}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            restrictPosition={false}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className={styles.cropControls}>
          <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
        </div>
        <div className={styles.cropFoot}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onCancel}>Cancelar</button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={procesando || !croppedAreaPixels} onClick={handleConfirm}>
            {procesando ? 'Aplicando…' : 'Aplicar recorte'} <IconCheck />
          </button>
        </div>
      </div>
    </div>
  );
}
