import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import type { BoundingBox } from '../types/azure';

export type DrawableBox = BoundingBox & {
  id: string;
  label?: string;
  color?: string;
};

type Props = {
  imageUrl: string;
  boxes?: DrawableBox[];
  selectedBoxId?: string | null;
  onBoxClick?: (id: string) => void;
  containerHeight?: number;
};

export default function ImageCanvas({
  imageUrl,
  boxes = [],
  selectedBoxId,
  onBoxClick,
  containerHeight = 480,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => setImg(image);
    image.src = imageUrl;
  }, [imageUrl]);

  const scale = useMemo(() => {
    if (!img) return 1;
    const ratio = containerHeight / img.height;
    return ratio;
  }, [img, containerHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (const box of boxes) {
      const x = Math.round(box.x * scale);
      const y = Math.round(box.y * scale);
      const w = Math.round(box.w * scale);
      const h = Math.round(box.h * scale);
      const isSelected = box.id === selectedBoxId;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeStyle = isSelected ? '#ff4081' : box.color || '#00e5ff';
      ctx.strokeRect(x, y, w, h);
      if (box.label) {
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '12px sans-serif';
        ctx.fillText(box.label, x + 4, y + 14);
      }
    }
  }, [img, boxes, selectedBoxId, scale]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onBoxClick || !img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    const hit = boxes.find(
      (b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
    );
    if (hit) onBoxClick(hit.id);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.12)',
          cursor: boxes.length ? 'pointer' : 'default',
        }}
        onClick={handleClick}
      />
    </Box>
  );
}


