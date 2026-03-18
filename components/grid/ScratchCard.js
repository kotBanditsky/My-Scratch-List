import React, { useState, useRef, useEffect, useCallback } from "react";
import { universalPost } from "../api";
import { useSession } from "next-auth/react";
import { useAtom } from "jotai";
import { isOpeningAll } from "../atoms/atoms";
import { ru } from "../messages/ru";
import { en } from "../messages/en";
import { useRouter } from "next/router";

const SquareCard = ({ title, childToParent }) => {
  const [openingall, setOpeningAll] = useAtom(isOpeningAll);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const contextRef = useRef(null);
  const router = useRouter();
  const t = router.locale === "en" ? en : ru;
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const data = true;
  const { data: session } = useSession();

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    let gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#1e1038");
    gradient.addColorStop(0.4, "#14203a");
    gradient.addColorStop(0.7, "#1a1040");
    gradient.addColorStop(1, "#0f1a30");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    contextRef.current = ctx;
  }, []);

  useEffect(() => {
    initCanvas();
    const observer = new ResizeObserver(() => initCanvas());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [initCanvas]);

  const brushRadius = () => {
    const canvas = canvasRef.current;
    return canvas ? Math.max(12, canvas.width * 0.06) : 16;
  };

  const checkCompletion = (ctx, threshold) => {
    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixelCount = canvas.width * canvas.height;
    let transparentPixelCount = 0;
    for (let i = 3; i < pixelCount * 4; i += 4) {
      if (imageData.data[i] <= 0) transparentPixelCount++;
    }
    let pct = (transparentPixelCount / pixelCount) * 250;
    if (pct > threshold) {
      setIsCompleted(true);
      if (session) {
        universalPost(
          session.user._id,
          JSON.stringify({
            name: title,
            date: Date.now(),
            id: session.user._id,
            methodic: "uniapiputgame",
          }),
          "uniapiputgame",
          t.is_scratched
        ).then((result) => setOpeningAll(result));
        childToParent(data);
      }
    }
  };

  const handleMouseDown = (e) => {
    contextRef.current.beginPath();
    contextRef.current.moveTo(e.offsetX, e.offsetY);
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.globalCompositeOperation = "destination-out";
    ctx.arc(e.nativeEvent.offsetX, e.nativeEvent.offsetY, brushRadius(), 0, Math.PI * 2);
    ctx.fill();
    checkCompletion(ctx, 95);
  };

  const handleTouchStart = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleTouchmove = (e) => {
    if (!isDrawing) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.globalCompositeOperation = "destination-out";
    ctx.arc(x, y, brushRadius(), 0, Math.PI * 2);
    ctx.fill();
    checkCompletion(ctx, 75);
  };

  if (isCompleted) return <div></div>;

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        style={{ touchAction: "pan-x", width: "100%", height: "100%" }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOut={() => setIsDrawing(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleMouseUp}
        onTouchMove={handleTouchmove}
        ref={canvasRef}
      />
    </div>
  );
};

export default SquareCard;
