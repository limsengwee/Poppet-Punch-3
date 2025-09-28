


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaceBoundingBox, Dent, Spider, Needle, Bruise, Swelling, SlapAnimation } from './types';
import { detectFace, applyGenerativeImageEffect } from './services/geminiService';
import { 
    MalletIcon, SpinnerIcon, UploadIcon, CameraIcon, CoinIcon, HandIcon, VoodooNeedleIcon, SpiderIcon, FistIcon, SkullIcon, TornadoIcon, RestartIcon, BroomIcon, CrackIcon, UglyIcon 
} from './components/icons';

const AnimatedMalletCursor: React.FC<{ position: { x: number, y: number } | null, visible: boolean }> = ({ position, visible }) => {
  if (!visible || !position) return null;
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: position.x, top: position.y, transform: 'translate(-10px, -30px)' }}
    >
      <style>{`
          @keyframes wobble {
            0%, 100% { transform: rotate(-55deg); }
            50% { transform: rotate(-35deg); }
          }
      `}</style>
      <MalletIcon
        className="w-10 h-10 text-yellow-400 drop-shadow-lg"
        style={{ animation: 'wobble 0.5s ease-in-out infinite' }}
      />
    </div>
  );
};

const tools = [
    { id: 'hand', name: '手拍', icon: HandIcon },
    { id: 'mallet', name: '木槌', icon: MalletIcon },
    { id: 'fistPunch', name: '水泡', icon: FistIcon },
    { id: 'voodooSpider', name: '巫毒蜘蛛', icon: SpiderIcon },
    { id: 'voodooNeedle', name: '巫毒针', icon: VoodooNeedleIcon },
    { id: 'shatter', name: '碎裂', icon: CrackIcon },
    { id: 'ugly', name: '丑化', icon: UglyIcon },
    { id: 'skull', name: '骷髅', icon: SkullIcon },
    { id: 'tornado', name: '龙卷风', icon: TornadoIcon },
];

type ToolId = typeof tools[number]['id'];

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [faceBox, setFaceBox] = useState<FaceBoundingBox | null>(null);
  const [dents, setDents] = useState<Dent[]>([]);
  const [spiders, setSpiders] = useState<Spider[]>([]);
  const [needles, setNeedles] = useState<Needle[]>([]);
  const [bruises, setBruises] = useState<Bruise[]>([]);
  const [swellings, setSwellings] = useState<Swelling[]>([]);
  const [slapAnimations, setSlapAnimations] = useState<SlapAnimation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [isHoveringFace, setIsHoveringFace] = useState<boolean>(false);

  const [coins, setCoins] = useState<number>(480);
  const [hitCount, setHitCount] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<ToolId>('mallet');
  const [strength, setStrength] = useState<number>(50);
  const [hasDestructiveChanges, setHasDestructiveChanges] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const renderInfo = useRef({ offsetX: 0, offsetY: 0, finalWidth: 1, finalHeight: 1 });
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const nonDestructiveEffectsBackup = useRef<{dents: Dent[], spiders: Spider[], needles: Needle[], bruises: Bruise[], swellings: Swelling[]}>({ dents: [], spiders: [], needles: [], bruises: [], swellings: [] });

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;

    const sourceToDraw = offscreenCanvas || image;
    if (!ctx || !canvas || !sourceToDraw || (sourceToDraw === image && (!image.complete || image.naturalWidth === 0))) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const canvasRatio = canvas.width / canvas.height;
    const sourceWidth = sourceToDraw.width;
    const sourceHeight = sourceToDraw.height;
    const imageRatio = sourceWidth / sourceHeight;


    let finalWidth, finalHeight, offsetX, offsetY;

    if (canvasRatio > imageRatio) {
      finalHeight = canvas.height;
      finalWidth = finalHeight * imageRatio;
      offsetX = (canvas.width - finalWidth) / 2;
      offsetY = 0;
    } else {
      finalWidth = canvas.width;
      finalHeight = finalWidth / imageRatio;
      offsetY = (canvas.height - finalHeight) / 2;
      offsetX = 0;
    }
    
    renderInfo.current = { offsetX, offsetY, finalWidth, finalHeight };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sourceToDraw, offsetX, offsetY, finalWidth, finalHeight);

    const now = performance.now();
    const animationDuration = 500;

    dents.forEach(dent => {
      const centerX = offsetX + dent.x * finalWidth;
      const centerY = offsetY + dent.y * finalHeight;
      const radius = dent.radius * Math.min(finalWidth, finalHeight);
      
      const shadowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGradient.addColorStop(0.7, dent.shadowColor.replace(/[\d\.]+\)$/, '0.3)'));
      shadowGradient.addColorStop(1, dent.shadowColor.replace(/[\d\.]+\)$/, '0.7)'));
      ctx.fillStyle = shadowGradient;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.8, dent.rotation, 0, Math.PI * 2);
      ctx.fill();

      const highlightGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
      highlightGradient.addColorStop(0, dent.highlightColor);
      highlightGradient.addColorStop(1, dent.highlightColor.replace(/[\d\.]+\)$/, '0)'));
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 0.8, radius, dent.rotation, 0, Math.PI * 2);
      ctx.fill();
      
      const age = now - dent.createdAt;
      if (age < animationDuration) {
          const progress = age / animationDuration;
          const easeOutProgress = 1 - Math.pow(1 - progress, 3);
          const rippleRadius = radius * (1 + easeOutProgress * 2);
          const rippleOpacity = 1 - progress;
          const rippleWidth = 3 * (1 - easeOutProgress);
          ctx.strokeStyle = `rgba(250, 204, 21, ${rippleOpacity * 0.8})`;
          ctx.lineWidth = rippleWidth;
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, 2 * Math.PI);
          ctx.stroke();
      }
    });

    spiders.forEach(spider => {
      const cx = offsetX + spider.x * finalWidth;
      const cy = offsetY + spider.y * finalHeight;
      const size = spider.size * Math.min(finalWidth, finalHeight);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(spider.rotation + Math.PI / 2); // adjust rotation to face forward
      drawSpider(ctx, size);
      ctx.restore();
    });

    needles.forEach(needle => {
        const cx = offsetX + needle.x * finalWidth;
        const cy = offsetY + needle.y * finalHeight;
        const length = needle.length * Math.min(finalWidth, finalHeight);
        const headRadius = 4.5;
        const shaftWidth = 2;

        // 1. Puncture Wound - more detailed
        // Dark inner hole
        ctx.fillStyle = 'rgba(10, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(cx, cy, shaftWidth / 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Irritated skin around the puncture
        const woundGradient = ctx.createRadialGradient(cx, cy, shaftWidth, cx, cy, headRadius * 2.5);
        woundGradient.addColorStop(0, 'rgba(150, 50, 50, 0.4)');
        woundGradient.addColorStop(0.7, 'rgba(100, 30, 30, 0.2)');
        woundGradient.addColorStop(1, 'rgba(100, 30, 30, 0)');
        ctx.fillStyle = woundGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, headRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 2. Needle drawing
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(needle.rotation);

        // Shadow for the needle. Cast it away from the needle's "exit" point.
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        const entryOffset = -2;

        // Needle Shaft with gradient for 3D effect
        const shaftGradient = ctx.createLinearGradient(-shaftWidth, 0, shaftWidth, 0);
        shaftGradient.addColorStop(0, '#71717a'); // Dark edge
        shaftGradient.addColorStop(0.4, '#e5e5e5'); // Highlight
        shaftGradient.addColorStop(1, '#a1a1aa'); // Main color

        ctx.strokeStyle = shaftGradient;
        ctx.lineWidth = shaftWidth;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, entryOffset); // Start slightly "inside" the hole to create depth
        ctx.lineTo(0, -length);
        ctx.stroke();

        // Needle Head
        ctx.fillStyle = needle.color;
        ctx.beginPath();
        ctx.arc(0, -length, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow for head highlight
        ctx.shadowColor = 'transparent';

        // Highlight on the head
        const gradient = ctx.createRadialGradient(
            -headRadius * 0.4, -length - headRadius * 0.4, 0,
            -headRadius * 0.4, -length - headRadius * 0.4, headRadius * 1.5
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, -length, headRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
    });

    bruises.forEach(bruise => {
      const centerX = offsetX + bruise.x * finalWidth;
      const centerY = offsetY + bruise.y * finalHeight;
      const radiusX = bruise.radius * bruise.aspectRatio * Math.min(finalWidth, finalHeight);
      const radiusY = bruise.radius * Math.min(finalWidth, finalHeight);
      const intensity = bruise.intensity;

      ctx.save();

      // 1. Irritated skin base
      ctx.globalCompositeOperation = 'overlay';
      const irritationRadius = Math.max(radiusX, radiusY) * 2.5;
      const irritationGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, irritationRadius
      );
      irritationGradient.addColorStop(0, `rgba(220, 80, 80, ${0.35 * intensity})`);
      irritationGradient.addColorStop(0.5, `rgba(200, 100, 100, ${0.2 * intensity})`);
      irritationGradient.addColorStop(1, 'rgba(200, 100, 100, 0)');
      ctx.fillStyle = irritationGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, irritationRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Create main ellipse path
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, bruise.rotation, 0, 2 * Math.PI);

      // 2. Inner shadow for depth
      ctx.globalCompositeOperation = 'multiply';
      const shadowGradient = ctx.createRadialGradient(
          centerX + radiusX * 0.3, centerY + radiusY * 0.3, 0,
          centerX, centerY, Math.max(radiusX, radiusY) * 1.5
      );
      shadowGradient.addColorStop(0, 'rgba(100, 40, 40, 0)');
      shadowGradient.addColorStop(1, `rgba(100, 40, 40, ${0.4 * intensity})`);
      ctx.fillStyle = shadowGradient;
      ctx.fill();

      // 3. Blister Body fill (the liquid)
      ctx.globalCompositeOperation = 'soft-light';
      const bodyGradient = ctx.createRadialGradient(
          centerX - radiusX * 0.3, centerY - radiusY * 0.3, 0,
          centerX, centerY, Math.max(radiusX, radiusY)
      );
      bodyGradient.addColorStop(0, `rgba(255, 250, 220, ${0.9 * intensity})`);
      bodyGradient.addColorStop(1, `rgba(255, 220, 200, ${0.6 * intensity})`);
      ctx.fillStyle = bodyGradient;
      ctx.fill();
      
      // 4. Glossy Highlight
      ctx.globalCompositeOperation = 'overlay';
      const highlightRadius = Math.max(radiusX, radiusY);
      const highlightGradient = ctx.createRadialGradient(
          centerX - radiusX * 0.4, centerY - radiusY * 0.4, 0,
          centerX - radiusX * 0.4, centerY - radiusY * 0.4, highlightRadius * 0.7
      );
      highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * intensity})`);
      highlightGradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.7 * intensity})`);
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      ctx.restore();
    });
    
    swellings.forEach(swell => {
      const age = performance.now() - swell.createdAt;
      const animDuration = 500; // fade in duration

      const progress = Math.min(age / animDuration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentIntensity = swell.intensity * easeOutProgress;
      if (currentIntensity <= 0) return;

      const centerX = offsetX + swell.x * finalWidth;
      const centerY = offsetY + swell.y * finalHeight;
      const radiusX = swell.radius * swell.aspectRatio * Math.min(finalWidth, finalHeight);
      const radiusY = swell.radius * Math.min(finalWidth, finalHeight);
      
      ctx.save();
      
      // Layer 1: Base redness
      ctx.globalCompositeOperation = 'overlay';
      const baseRadius = Math.max(radiusX, radiusY) * 1.8;
      const grad1 = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius);
      grad1.addColorStop(0.2, `rgba(200, 40, 40, ${0.5 * currentIntensity})`);
      grad1.addColorStop(1, `rgba(200, 40, 40, 0)`);
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Swelling Highlight
      ctx.globalCompositeOperation = 'soft-light';
      const grad2 = ctx.createRadialGradient(
          centerX - radiusX * 0.2, centerY - radiusY * 0.2, 0,
          centerX, centerY, Math.max(radiusX, radiusY) * 1.2
      );
      grad2.addColorStop(0, `rgba(255, 200, 200, ${0.6 * currentIntensity})`);
      grad2.addColorStop(1, `rgba(255, 200, 200, 0)`);
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, swell.rotation, 0, Math.PI * 2);
      ctx.fill();
      
      // Layer 3: Impact core
      ctx.globalCompositeOperation = 'color-burn';
      const grad3 = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, Math.max(radiusX, radiusY)
      );
      grad3.addColorStop(0, `rgba(150, 0, 0, ${0.4 * currentIntensity})`);
      grad3.addColorStop(0.8, `rgba(150, 0, 0, 0)`);
      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, swell.rotation, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    ctx.globalCompositeOperation = 'source-over';

    slapAnimations.forEach(anim => {
        const age = now - anim.createdAt;
        const duration = 400; //ms

        if (age > duration) return;

        const progress = age / duration;

        ctx.save();
        
        const size = anim.size * Math.min(finalWidth, finalHeight);
        
        const startDist = size * 2.5;
        let currentDist = 0;
        let alpha = 1.0;
        
        if (progress < 0.25) { // Fast approach
            const t = progress / 0.25;
            const easeOutT = 1 - Math.pow(1 - t, 3);
            currentDist = startDist * (1 - easeOutT);
            alpha = t;
        } else { // Hold and retract
            const t = (progress - 0.25) / 0.75;
            const easeInT = t * t;
            currentDist = easeInT * (startDist * 0.5);
            alpha = 1 - t;
        }

        const angle = anim.rotation - Math.PI / 2; // Hand comes from the side
        const handX = offsetX + anim.x * finalWidth + Math.cos(angle) * currentDist;
        const handY = offsetY + anim.y * finalHeight + Math.sin(angle) * currentDist;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgba(255, 220, 200, ${alpha * 0.9})`;

        ctx.translate(handX, handY);
        ctx.rotate(anim.rotation);
        
        const drawHandPrint = (ctx: CanvasRenderingContext2D, size: number) => {
            const drawFinger = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number) => {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rot);
                ctx.beginPath();
                ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };
            const palmWidth = size;
            const palmHeight = size * 1.1;
            ctx.beginPath();
            ctx.ellipse(0, 0, palmWidth / 2, palmHeight / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            const fingerWidth = size * 0.25;
            const fingerLength = size * 0.9;
            const fingerBaseY = -palmHeight / 2;
            drawFinger(ctx, -palmWidth * 0.35, fingerBaseY, fingerWidth * 0.8, fingerLength * 0.7, 0.2);
            drawFinger(ctx, -palmWidth * 0.1, fingerBaseY, fingerWidth, fingerLength * 0.9, 0.05);
            drawFinger(ctx, palmWidth * 0.15, fingerBaseY, fingerWidth, fingerLength, -0.05);
            drawFinger(ctx, palmWidth * 0.38, fingerBaseY, fingerWidth * 0.95, fingerLength * 0.85, -0.2);
            ctx.save();
            ctx.translate(-palmWidth/2 * 0.8, palmHeight/2 * 0.4);
            ctx.rotate(-0.9);
            ctx.beginPath();
            ctx.ellipse(0, 0, fingerWidth * 1.1, fingerLength * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        drawHandPrint(ctx, size);

        ctx.restore();
    });


  }, [dents, spiders, needles, bruises, swellings, slapAnimations]);
  
  const resetState = useCallback(() => {
    if (imageSrc && imageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageFile(null);
    setImageSrc(null);
    setFaceBox(null);
    setDents([]);
    setSpiders([]);
    setNeedles([]);
    setBruises([]);
    setSwellings([]);
    setSlapAnimations([]);
    setIsLoading(false);
    setError(null);
    setIsHoveringFace(false);
    setMousePosition(null);
    setHitCount(0);
    setCoins(480); // Reset coins to initial value
    setHasDestructiveChanges(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    offscreenCanvasRef.current = null;
  }, [imageSrc]);
  
  const resetEffects = useCallback(() => {
    setDents([]);
    setSpiders([]);
    setNeedles([]);
    setBruises([]);
    setSwellings([]);
    setSlapAnimations([]);
    setHitCount(0);
    setHasDestructiveChanges(false);

    const offscreenCanvas = offscreenCanvasRef.current;
    const image = imageRef.current;
    if (offscreenCanvas && image && image.complete) {
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (offscreenCtx) {
            offscreenCanvas.width = image.naturalWidth;
            offscreenCanvas.height = image.naturalHeight;
            offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            offscreenCtx.drawImage(image, 0, 0);
            redrawCanvas();
        }
    }
  }, [redrawCanvas]);

  const drawSpider = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.fillStyle = '#1a1a1a';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = size * 0.1;

      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.7, size, Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.arc(0, size * 0.8, size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      const leg = (s: number, flip = false) => {
          const m = flip ? -1 : 1;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.2);
          ctx.lineTo(m * s * 1.5, s * 0.5);
          ctx.lineTo(m * s * 2, -s * 0.5);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, -s*0.1);
          ctx.lineTo(m * s * 1.8, -s*0.3);
          ctx.lineTo(m * s * 2.2, -s*1.2);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(0, s * 0.5);
          ctx.lineTo(m * s * 1.2, s * 1.2);
          ctx.lineTo(m * s * 1.8, s * 1.8);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, -s*0.4);
          ctx.lineTo(m * s * 1.0, -s * 1.5);
          ctx.lineTo(m * s * 1.5, -s * 2.2);
          ctx.stroke();
      };
      leg(size);
      leg(size, true);
  };

  useEffect(() => {
    const image = imageRef.current;
    if (!image || !imageSrc) return;

    const initializeCanvases = () => {
        if (!offscreenCanvasRef.current) {
            offscreenCanvasRef.current = document.createElement('canvas');
        }
        const offscreenCanvas = offscreenCanvasRef.current;
        offscreenCanvas.width = image.naturalWidth;
        offscreenCanvas.height = image.naturalHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx?.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
        
        redrawCanvas();
    };

    if (image.complete && image.naturalWidth > 0) {
        initializeCanvases();
    } else {
        image.addEventListener('load', initializeCanvases);
    }

    return () => {
        image.removeEventListener('load', initializeCanvases);
    };
  }, [imageSrc, redrawCanvas]);

  useEffect(() => {
    window.addEventListener('resize', redrawCanvas);
    return () => window.removeEventListener('resize', redrawCanvas);
  }, [redrawCanvas]);
  
  useEffect(() => {
    let animationFrameId: number;
    const needsAnimation = dents.some(d => (performance.now() - d.createdAt) < 500);
    if (!needsAnimation) return;
    const animate = () => {
        redrawCanvas();
        if (dents.some(d => (performance.now() - d.createdAt) < 500)) {
            animationFrameId = requestAnimationFrame(animate);
        }
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dents, redrawCanvas]);

    useEffect(() => {
        let animationFrameId: number;
        const swellingDuration = 500;
        const slapAnimationDuration = 400;

        const needsAnimation = 
            swellings.some(s => (performance.now() - s.createdAt) < swellingDuration) ||
            slapAnimations.length > 0;

        if (!needsAnimation) return;

        const animate = () => {
            const now = performance.now();
            const stillNeedsSwellingAnim = swellings.some(s => (now - s.createdAt) < swellingDuration);
            const stillNeedsSlapAnim = slapAnimations.some(a => (now - a.createdAt) < slapAnimationDuration);

            if (stillNeedsSwellingAnim || stillNeedsSlapAnim) {
                redrawCanvas();
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setSlapAnimations([]); // Clean up finished animations
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [swellings, slapAnimations, redrawCanvas]);

  useEffect(() => {
    if (spiders.length === 0) return;
    let animationFrameId: number;
    const animate = () => {
        setSpiders(currentSpiders => currentSpiders.map(spider => {
            const dx = spider.targetX - spider.x;
            const dy = spider.targetY - spider.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let newTargetX = spider.targetX;
            let newTargetY = spider.targetY;
            let newSpeed = spider.speed;

            if (dist < 0.04) {
                if (faceBox) {
                    newTargetX = faceBox.x + Math.random() * faceBox.width;
                    newTargetY = faceBox.y + Math.random() * faceBox.height;
                } else {
                    newTargetX = Math.random();
                    newTargetY = Math.random();
                }
                newSpeed = 0.002 + Math.random() * 0.003;
            }
            
            const angle = Math.atan2(dy, dx);
            const wander = (Math.random() - 0.5) * 0.4;
            const newRotation = angle + wander;

            const newX = spider.x + Math.cos(newRotation) * newSpeed;
            const newY = spider.y + Math.sin(newRotation) * newSpeed;
            
            return { 
                ...spider, 
                x: newX, 
                y: newY, 
                rotation: newRotation, 
                targetX: newTargetX, 
                targetY: newTargetY, 
                speed: newSpeed 
            };
        }));
        animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [spiders.length, faceBox]);


  const runFaceDetection = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFaceBox(null);
    setDents([]);
    setSpiders([]);
    setNeedles([]);
    setBruises([]);
    setSwellings([]);
    setHitCount(0);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      const base64String = (e.target?.result as string)?.split(',')[1];
      if (!base64String) {
        setError('Could not read image file.');
        setIsLoading(false);
        return;
      }
      const detectedFace = await detectFace(base64String, file.type);
      if (detectedFace) setFaceBox(detectedFace);
      setIsLoading(false);
    };
    reader.onerror = () => { setError("Failed to read file."); setIsLoading(false); }
  }, []);

  const handleImageLoaded = useCallback(() => {
    if (imageFile) {
        runFaceDetection(imageFile);
    }
  }, [imageFile, runFaceDetection]);

  useEffect(() => {
      const img = imageRef.current;
      if (img && imageSrc) {
          img.addEventListener('load', handleImageLoaded);
          // If the image is already loaded (e.g., from cache), trigger detection manually.
          if (img.complete && img.naturalWidth > 0) {
              handleImageLoaded();
          }
          return () => {
              img.removeEventListener('load', handleImageLoaded);
          };
      }
  }, [imageSrc, handleImageLoaded]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageFile(file);
      setImageSrc(URL.createObjectURL(file));
      
      // Reset everything for the new image
      setFaceBox(null);
      setDents([]);
      setSpiders([]);
      setNeedles([]);
      setBruises([]);
      setSwellings([]);
      setSlapAnimations([]);
      setHitCount(0);
      setHasDestructiveChanges(false);
      offscreenCanvasRef.current = null;
    }
  };

  const getPosOnImage = (event: React.MouseEvent<HTMLElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const { offsetX, offsetY, finalWidth, finalHeight } = renderInfo.current;
    if (mouseX < offsetX || mouseX > offsetX + finalWidth || mouseY < offsetY || mouseY > offsetY + finalHeight) return null;
    return { x: (mouseX - offsetX) / finalWidth, y: (mouseY - offsetY) / finalHeight, absoluteX: mouseX, absoluteY: mouseY };
  };
  
  const applyTornadoEffect = (canvasX: number, canvasY: number) => {
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!offscreenCanvas) return;

    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    if (!offscreenCtx) return;

    const { finalWidth, finalHeight, offsetX, offsetY } = renderInfo.current;
    
    const imageX = ((canvasX - offsetX) / finalWidth) * offscreenCanvas.width;
    const imageY = ((canvasY - offsetY) / finalHeight) * offscreenCanvas.height;

    const radius = (strength / 100) * (Math.min(offscreenCanvas.width, offscreenCanvas.height) * 0.15);
    const angle = (strength / 100) * Math.PI;

    if (radius <= 0) return;

    const startX = Math.floor(Math.max(0, imageX - radius));
    const startY = Math.floor(Math.max(0, imageY - radius));
    const width = Math.floor(Math.min(offscreenCanvas.width, imageX + radius)) - startX;
    const height = Math.floor(Math.min(offscreenCanvas.height, imageY + radius)) - startY;

    if (width <= 0 || height <= 0) return;

    const originalData = offscreenCtx.getImageData(startX, startY, width, height);
    const warpedData = offscreenCtx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const currentX = startX + x;
            const currentY = startY + y;

            const dx = currentX - imageX;
            const dy = currentY - imageY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const pixelIndex = (y * width + x) * 4;

            if (distance < radius) {
                const percent = 1 - (distance / radius);
                const theta = Math.atan2(dy, dx);
                const twistAngle = percent * percent * angle;

                const srcX = Math.floor(imageX + distance * Math.cos(theta - twistAngle));
                const srcY = Math.floor(imageY + distance * Math.sin(theta - twistAngle));
                
                if (srcX >= startX && srcX < startX + width && srcY >= startY && srcY < startY + height) {
                    const srcIndex = ((srcY - startY) * width + (srcX - startX)) * 4;
                    warpedData.data[pixelIndex] = originalData.data[srcIndex];
                    warpedData.data[pixelIndex + 1] = originalData.data[srcIndex + 1];
                    warpedData.data[pixelIndex + 2] = originalData.data[srcIndex + 2];
                    warpedData.data[pixelIndex + 3] = originalData.data[srcIndex + 3];
                } else {
                    warpedData.data[pixelIndex] = originalData.data[pixelIndex];
                    warpedData.data[pixelIndex + 1] = originalData.data[pixelIndex + 1];
                    warpedData.data[pixelIndex + 2] = originalData.data[pixelIndex + 2];
                    warpedData.data[pixelIndex + 3] = originalData.data[pixelIndex + 3];
                }
            } else {
                warpedData.data[pixelIndex] = originalData.data[pixelIndex];
                warpedData.data[pixelIndex + 1] = originalData.data[pixelIndex + 1];
                warpedData.data[pixelIndex + 2] = originalData.data[pixelIndex + 2];
                warpedData.data[pixelIndex + 3] = originalData.data[pixelIndex + 3];
            }
        }
    }
    
    offscreenCtx.putImageData(warpedData, startX, startY);
    setHasDestructiveChanges(true);
    redrawCanvas();
  };

    const handleAIEffect = async (promptGenerator: (strength: number) => string) => {
        if (!offscreenCanvasRef.current || !imageFile) return;

        setIsLoading(true);
        setError(null);
        
        nonDestructiveEffectsBackup.current = { dents, spiders, needles, bruises, swellings };
        setDents([]);
        setSpiders([]);
        setNeedles([]);
        setBruises([]);
        setSwellings([]);
        setSlapAnimations([]);

        try {
            const base64ImageData = offscreenCanvasRef.current.toDataURL(imageFile.type).split(',')[1];
            if (!base64ImageData) {
                throw new Error("Could not get image data from canvas.");
            }

            const prompt = promptGenerator(strength);
            
            const resultBase64 = await applyGenerativeImageEffect(base64ImageData, imageFile.type, prompt);

            if (resultBase64) {
                const newImage = new Image();
                newImage.onload = () => {
                    const offscreenCanvas = offscreenCanvasRef.current;
                    if (offscreenCanvas) {
                        const offscreenCtx = offscreenCanvas.getContext('2d');
                        offscreenCanvas.width = newImage.naturalWidth;
                        offscreenCanvas.height = newImage.naturalHeight;
                        offscreenCtx?.drawImage(newImage, 0, 0);
                        setHasDestructiveChanges(true);
                        redrawCanvas();
                    }
                };
                newImage.src = `data:${imageFile.type};base64,${resultBase64}`;
                setHitCount(prev => prev + 1);
                setCoins(prev => prev + 10);
            } else {
                setError("AI failed to generate the effect. These effects can be tricky, so please try again or adjust the strength.");
                // Restore non-destructive effects on failure
                setDents(nonDestructiveEffectsBackup.current.dents);
                setSpiders(nonDestructiveEffectsBackup.current.spiders);
                setNeedles(nonDestructiveEffectsBackup.current.needles);
                setBruises(nonDestructiveEffectsBackup.current.bruises);
                setSwellings(nonDestructiveEffectsBackup.current.swellings);
            }
        } catch (e) {
            console.error(e);
            setError("An error occurred while applying the AI effect.");
            // Restore non-destructive effects on error
            setDents(nonDestructiveEffectsBackup.current.dents);
            setSpiders(nonDestructiveEffectsBackup.current.spiders);
            setNeedles(nonDestructiveEffectsBackup.current.needles);
            setBruises(nonDestructiveEffectsBackup.current.bruises);
            setSwellings(nonDestructiveEffectsBackup.current.swellings);
        } finally {
            setIsLoading(false);
        }
    };
    
  const playSlapSound = useCallback((strength: number) => {
      if (!audioContextRef.current) {
          try {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          } catch (e) {
              console.error("Web Audio API is not supported.", e);
              return;
          }
      }
      const audioContext = audioContextRef.current;
      if (!audioContext || audioContext.state === 'suspended') {
          audioContext?.resume();
      }
      if (!audioContext) return;

      const now = audioContext.currentTime;
      const s = strength / 100;

      // Layer 1: The low-frequency "thump" of the impact
      const thump = audioContext.createOscillator();
      thump.type = 'sine';
      
      const thumpGain = audioContext.createGain();
      const thumpStartFreq = 180 - s * 80; // Stronger slap = lower frequency (180Hz down to 100Hz)
      const thumpEndFreq = 50;
      const thumpVolume = 0.4 + s * 0.4; // 0.4 to 0.8 volume

      thump.frequency.setValueAtTime(thumpStartFreq, now);
      thump.frequency.exponentialRampToValueAtTime(thumpEndFreq, now + 0.15);
      
      thumpGain.gain.setValueAtTime(thumpVolume, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      thump.connect(thumpGain);
      thumpGain.connect(audioContext.destination);

      // Layer 2: The high-frequency "crack" of the slap
      const bufferSize = audioContext.sampleRate * 0.1; // 0.1s of noise is enough
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1; // White noise
      }

      const crack = audioContext.createBufferSource();
      crack.buffer = buffer;

      const crackGain = audioContext.createGain();
      const crackVolume = 0.5 + s * 0.5; // 0.5 to 1.0 volume
      
      // A very sharp attack and quick decay for the "crack"
      crackGain.gain.setValueAtTime(0, now);
      crackGain.gain.linearRampToValueAtTime(crackVolume, now + 0.002);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + s * 0.02);

      const bandpass = audioContext.createBiquadFilter();
      bandpass.type = 'bandpass';
      // Stronger slap = higher frequency, sharper sound
      const crackFreq = 2000 + s * 5000; // 2000Hz up to 7000Hz
      bandpass.frequency.value = crackFreq;
      bandpass.Q.value = 0.8;

      crack.connect(bandpass);
      bandpass.connect(crackGain);
      crackGain.connect(audioContext.destination);

      thump.start(now);
      crack.start(now);
      
      thump.stop(now + 0.2); // Clean up the oscillator
  }, []);

  const applyToolEffect = (pos: { x: number; y: number; absoluteX: number; absoluteY: number; }) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'mallet') {
        const pixelData = ctx.getImageData(pos.absoluteX, pos.absoluteY, 1, 1).data;
        const [r, g, b] = pixelData;
        const shadowColor = `rgba(${Math.max(0, r-50)}, ${Math.max(0, g-50)}, ${Math.max(0, b-50)}, 0.5)`;
        const highlightColor = `rgba(${Math.min(255, r+50)}, ${Math.min(255, g+50)}, ${Math.min(255, b+50)}, 0.5)`;
        
        const baseRadius = 0.02 + (strength / 100) * 0.04;
        const randomFactor = Math.random() * 0.01;

        const newDent: Dent = {
            x: pos.x, y: pos.y,
            radius: baseRadius + randomFactor,
            rotation: Math.random() * Math.PI * 2,
            shadowColor, highlightColor, createdAt: performance.now(),
        };
        setDents(prevDents => [...prevDents, newDent]);
        setHitCount(prev => prev + 1);
        setCoins(prev => prev + 5);
    } else if (activeTool === 'hand') {
        const baseRadius = 0.06 + (strength / 100) * 0.09;
        
        const newSwelling: Swelling = {
            x: pos.x,
            y: pos.y,
            radius: baseRadius,
            intensity: strength / 100,
            aspectRatio: 1 + (Math.random() - 0.5) * 0.7,
            rotation: Math.random() * Math.PI * 2,
            createdAt: performance.now(),
        };
        setSwellings(prev => [...prev, newSwelling]);

        const slapSize = 0.08 + (strength / 100) * 0.08;
        const rotation = (Math.random() - 0.5) * 0.5;

        setSlapAnimations(prev => [...prev, {
            id: performance.now(), x: pos.x, y: pos.y, 
            size: slapSize * 1.2, rotation, createdAt: performance.now()
        }]);
        
        playSlapSound(strength);
        
        setHitCount(prev => prev + 1);
        setCoins(prev => prev + 5);
    } else if (activeTool === 'voodooSpider') {
        const baseSize = 0.015 + (strength / 100) * 0.02;
        const randomFactor = Math.random() * 0.005;

        const newSpider: Spider = {
            id: performance.now(),
            x: pos.x,
            y: pos.y,
            size: baseSize + randomFactor,
            rotation: Math.random() * Math.PI * 2,
            speed: 0.002 + Math.random() * 0.003,
            targetX: faceBox ? faceBox.x + Math.random() * faceBox.width : Math.random(),
            targetY: faceBox ? faceBox.y + Math.random() * faceBox.height : Math.random(),
            createdAt: performance.now(),
        };
        setSpiders(prev => [...prev, newSpider]);
        setHitCount(prev => prev + 1);
        setCoins(prev => prev + 5);
    } else if (activeTool === 'voodooNeedle') {
        const minLength = 0.03;
        const maxLength = 0.12;
        const length = minLength + (strength / 100) * (maxLength - minLength);

        const voodooColors = ['#ef4444', '#f97316', '#facc15', '#4ade80', '#3b82f6', '#a855f7'];
        const color = voodooColors[Math.floor(Math.random() * voodooColors.length)];

        const newNeedle: Needle = {
            x: pos.x,
            y: pos.y,
            length: length,
            rotation: Math.random() * Math.PI * 2,
            color: color,
        };
        setNeedles(prev => [...prev, newNeedle]);
        setHitCount(prev => prev + 1);
        setCoins(prev => prev + 5);
    } else if (activeTool === 'fistPunch') {
      const numBlisters = 1 + Math.floor((strength / 100) * 4);
      const newBruises: Bruise[] = [];
      const clusterRadius = 0.02 + (strength / 100) * 0.04;

      for (let i = 0; i < numBlisters; i++) {
          const isMain = i === 0;
          const radius = (0.015 + (strength / 100) * 0.03) * (isMain ? 1 : (0.2 + Math.random() * 0.5));
          const angle = Math.random() * Math.PI * 2;
          const distance = isMain ? 0 : Math.random() * clusterRadius;

          newBruises.push({
              x: pos.x + Math.cos(angle) * distance,
              y: pos.y + Math.sin(angle) * distance,
              radius: radius,
              rotation: Math.random() * Math.PI * 2,
              aspectRatio: 1 + (Math.random() - 0.5) * 0.4,
              intensity: strength / 100,
          });
      }
      setBruises(prev => [...prev, ...newBruises]);
      setHitCount(prev => prev + 1);
      setCoins(prev => prev + 5);
    } else if (activeTool === 'shatter') {
        const promptGenerator = (strength: number) => {
             let prompt = "Transform the person's skin into a cracked, dry earth texture. The cracks should be noticeable and deep. The skin should look weathered. Preserve the original color and detail of the eyes.";
            if (strength <= 33) {
                prompt = "Apply a subtle network of fine, hair-like cracks to the person's skin, making it look like delicate, aging porcelain. Preserve the original color and detail of the eyes.";
            } else if (strength >= 67) {
                prompt = "Apply a hyper-realistic, heavily shattered stone texture to the person's skin. Create deep, dark chasms and a desaturated, greyish, rocky appearance. Make the effect dramatic but preserve the original color and detail of the eyes perfectly.";
            }
            return prompt;
        };
        handleAIEffect(promptGenerator);
    } else if (activeTool === 'ugly') {
        const promptGenerator = (strength: number) => {
            let description = '';

            if (strength <= 10) {
                description = "add subtle, unflattering features. Think slightly greasy skin, a faint sneer instead of their current expression, and shadows that make their eyes look colder and more menacing. The changes should be very minimal, but distinctly negative.";
            } else if (strength <= 30) {
                description = "introduce clear villainous traits. Give them sallow or unhealthy-looking skin, a noticeable scowl or contemptuous expression, and make their eyes appear cruel and unsettling. Perhaps add a small, poorly-healed scar.";
            } else if (strength <= 60) {
                description = "significantly distort their features to be grotesque and evil. Introduce unnatural skin textures like warts or blotches, yellowing and crooked teeth visible in a snarl, and a deeply angry or hateful expression. The face should be asymmetrical and unpleasant.";
            } else if (strength <= 80) {
                description = "transform them into a monstrous creature. Add demonic or inhuman features like small horns, glowing red eyes, or decaying skin. The features should be heavily distorted and horrifying.";
            } else {
                description = "make them a nightmarish, terrifying monster, barely recognizable as human. This is maximum ugliness and evil. Think horrific mutations, a face contorted in pure malice, and features that inspire fear and disgust. Do not hold back on the horror elements.";
            }

            return `Make the person in this image look ugly and evil. The intensity of this transformation should be exactly ${strength} on a scale of 1 to 100.
At all levels, their expression must be negative, such as a scowl, sneer, or look of pure malice. DO NOT make them smile or look happy.

Based on the strength value of ${strength}, ${description}

Preserve the background, but apply these evil and ugly transformations to the person's face and features.`;
        };
        handleAIEffect(promptGenerator);
    } else if (activeTool === 'skull') {
        const promptGenerator = (strength: number) => {
            return `You are an expert special effects artist. Your task is to transform a person's face into a photorealistic human skull. It is CRITICAL that you follow the strength parameter precisely.
The transformation should look as if the skin is being peeled away or becoming transparent to reveal the skull underneath.

The transformation strength is ${strength} on a scale of 1-100.
- If strength is 1-10: Reveal a very small, isolated part of the skull, like a patch on the cheekbone or forehead. The effect should be subtle.
- If strength is around 50: Roughly half the face should be transformed. Create a visually interesting boundary, like peeling or torn flesh, between the skin and the exposed skull.
- If strength is 90-100: The entire face (skin, nose, eyes, lips) MUST be replaced by a complete, photorealistic, and anatomically correct human skull.

CRITICAL INSTRUCTIONS: You MUST perfectly preserve the original background, hair, ears, neck, and any clothing. The transformation must ONLY apply to the facial area. The result must be photorealistic.`
        };
        handleAIEffect(promptGenerator);
    }
  };
  
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const pos = getPosOnImage(event);
    if (!pos || !imageSrc || isLoading) return;

    let canHit = false;
    if (faceBox) {
        if (pos.x >= faceBox.x && pos.x <= faceBox.x + faceBox.width && pos.y >= faceBox.y && pos.y <= faceBox.y + faceBox.height) {
            canHit = true;
        }
    } else {
        canHit = true; 
    }
    
    if (!canHit) return;

    if (activeTool === 'tornado') {
        isDraggingRef.current = true;
        applyTornadoEffect(pos.absoluteX, pos.absoluteY);
    } else {
        applyToolEffect(pos);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const currentMousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    setMousePosition(currentMousePos);
    
    const pos = getPosOnImage(event);
    if (!pos) return;


    if (isDraggingRef.current && activeTool === 'tornado') {
        applyTornadoEffect(pos.absoluteX, pos.absoluteY);
    }

    if (activeTool === 'mallet') {
        if (faceBox || !isLoading) {
            let isHovering = false;
            if (faceBox) {
                const { x, y } = pos;
                const { x: faceX, y: faceY, width: faceW, height: faceH } = faceBox;
                isHovering = (x >= faceX && x <= faceX + faceW && y >= faceY && y <= faceY + faceH);
            } else {
                isHovering = true;
            }
            setIsHoveringFace(isHovering);
        } else {
            setIsHoveringFace(false);
        }
    } else {
        setIsHoveringFace(false);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  
  const getCursor = () => {
      if (!imageSrc) return 'default';
      if (activeTool === 'mallet' && isHoveringFace) return 'none';
      if (['voodooSpider', 'voodooNeedle', 'fistPunch', 'shatter', 'ugly', 'skull'].includes(activeTool)) return 'crosshair';
      if (activeTool === 'tornado') return isDraggingRef.current ? 'grabbing' : 'grab';
      if (activeTool === 'hand') return 'grab';
      return 'default';
  }

  const ToolButton: React.FC<{tool: typeof tools[number]}> = ({ tool }) => {
    const isActive = activeTool === tool.id;
    return (
        <button
            onClick={() => setActiveTool(tool.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 aspect-square ${
                isActive ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'bg-slate-700/50 hover:bg-slate-600/ ৫০'
            }`}
            aria-label={tool.name}
        >
            <tool.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">{tool.name}</span>
        </button>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-slate-900 to-black text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 text-yellow-300">
            <h1 className="text-2xl sm:text-3xl font-bold">打小人! Poppet Punch!</h1>
            <div className="bg-black/30 px-4 py-2 rounded-full flex items-center gap-2 text-lg">
                <CoinIcon className="w-6 h-6"/>
                <span className="font-bold">{coins}</span>
                <span className="hidden sm:inline">Coins</span>
            </div>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-black/20 rounded-2xl shadow-lg p-2 sm:p-4 flex flex-col items-center justify-center min-h-[60vh] lg:min-h-[75vh]">
                {!imageSrc ? (
                    <div className="text-center p-4">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-100">上传你的小人</h2>
                        <p className="text-slate-400 mb-8 max-w-md">上传照片或使用摄像头拍摄，开始打小人吧!</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                            <button onClick={triggerFileInput} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors duration-300 shadow-lg">
                                <UploadIcon className="w-6 h-6" />
                                上传照片
                            </button>
                            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-600 transition-colors duration-300 shadow-lg" disabled>
                                <CameraIcon className="w-6 h-6" />
                                使用摄像头
                            </button>
                        </div>
                         <div className="mt-8 bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center gap-3 justify-center">
                            <span className="text-2xl">✔</span>
                            <p>基础锤子已启用 - 无需AI检测，直接开始游戏!</p>
                        </div>
                    </div>
                ) : (
                    <div 
                      className="relative w-full h-full rounded-lg overflow-hidden bg-slate-900/50"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={() => { setIsHoveringFace(false); setMousePosition(null); isDraggingRef.current = false; }}
                      style={{ cursor: getCursor() }}
                    >
                        <img ref={imageRef} src={imageSrc} alt="Uploaded" className="w-full h-full object-contain block opacity-0 pointer-events-none" />
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
                        <AnimatedMalletCursor position={mousePosition} visible={isHoveringFace} />
                        
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                                <SpinnerIcon className="w-12 h-12 text-yellow-400" />
                                <p className="mt-4 text-lg font-semibold animate-pulse">
                                  {activeTool === 'shatter' ? 'AI 正在生成裂纹...' :
                                   activeTool === 'ugly' ? 'AI 正在丑化...' :
                                   activeTool === 'skull' ? 'AI 正在生成骷髅...' :
                                   'Detecting face...'}
                                </p>
                            </div>
                        )}
                        {error && <div className="absolute bottom-4 left-4 right-4 text-center text-red-400 bg-red-900/50 px-4 py-2 rounded-md z-10">{error}</div>}
                    </div>
                )}
            </div>

            <aside className="bg-black/30 rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-6">
                <div id="toolbox">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold">工具箱</h3>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <CoinIcon className="w-5 h-5"/>
                            <span className="font-bold">{coins}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {tools.map(tool => <ToolButton key={tool.id} tool={tool} />)}
                    </div>
                    <p className="text-xs text-slate-400 text-center mt-3">所有工具已解锁! 尽情使用!</p>
                </div>

                <div id="strength-slider" className="bg-slate-800/40 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <label htmlFor="strength" className="font-bold text-slate-300">强度</label>
                        <span className="font-bold text-yellow-400 text-base">{strength}</span>
                    </div>
                    <input
                        id="strength"
                        type="range"
                        min="1"
                        max="100"
                        value={strength}
                        onChange={(e) => setStrength(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                </div>

                <button 
                    onClick={resetEffects}
                    disabled={dents.length === 0 && spiders.length === 0 && needles.length === 0 && bruises.length === 0 && swellings.length === 0 && !hasDestructiveChanges}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors duration-300 shadow-lg disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    <BroomIcon className="w-5 h-5" />
                    重置效果
                </button>

                <div id="progress-stats" className="bg-slate-800/40 p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-3">进度统计</h3>
                    <div className="text-center mb-3">
                        <p className="text-5xl font-bold text-yellow-300">{hitCount}</p>
                        <p className="text-slate-400 text-sm">总计击打次数</p>
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>进度</span>
                            <span>{hitCount > 0 ? 1 : 0}/1</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full" style={{width: `${hitCount > 0 ? 100 : 0}%`}}></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">下一个里程碑: 第一击</p>
                    </div>
                </div>

                <div id="rewards" className="bg-slate-800/40 p-4 rounded-lg text-sm">
                    <h3 className="text-xl font-bold mb-3">奖励</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">当前出价:</span>
                        <span className="font-bold text-lg text-yellow-300 flex items-center gap-1"><CoinIcon className="w-4 h-4" /> 480</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-slate-400">每次奖励:</span>
                        <span className="font-bold text-lg text-green-400">+5 金币</span>
                    </div>
                </div>
                
                <div className="mt-auto flex flex-col gap-2">
                    <button onClick={resetState} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-800 text-white font-bold rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg">
                        <RestartIcon className="w-6 h-6" />
                        重新开始
                    </button>
                </div>
            </aside>
        </main>
      </div>
    </div>
  );
};

export default App;