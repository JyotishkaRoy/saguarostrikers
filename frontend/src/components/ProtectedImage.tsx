import { useState, useRef, useEffect } from 'react';

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  watermark?: boolean;
  watermarkText?: string;
}

export default function ProtectedImage({ 
  src, 
  alt, 
  className = '', 
  watermark = false,
  watermarkText = '© Saguaro Strikers'
}: ProtectedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (watermark) {
      loadImageWithWatermark();
    } else {
      setImageSrc(src);
    }
  }, [src, watermark, watermarkText]);

  const loadImageWithWatermark = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Add watermark
      ctx.font = '30px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw watermark at bottom right
      const x = canvas.width - 150;
      const y = canvas.height - 30;
      ctx.fillText(watermarkText || '', x, y);

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setImageSrc(dataUrl);
    };
    img.src = src;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <>
      <img
        ref={imgRef}
        src={imageSrc || src}
        alt={alt}
        className={`select-none pointer-events-auto ${className}`}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
        draggable={false}
      />
      {watermark && (
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      )}
    </>
  );
}
