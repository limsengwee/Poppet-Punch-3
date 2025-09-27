import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaceBoundingBox, Dent, Spider, Needle, Bruise, Crack } from './types';
import { detectFace } from './services/geminiService';
import { 
    MalletIcon, SpinnerIcon, UploadIcon, CameraIcon, CoinIcon, HandIcon, VoodooNeedleIcon, SpiderIcon, FistIcon, SparkleIcon, LightningIcon, DistortIcon, RestartIcon, BroomIcon, CrackIcon 
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
    { id: 'crack', name: '裂纹', icon: CrackIcon },
    { id: 'rainbow', name: '彩虹', icon: SparkleIcon },
    { id: 'lightning', name: '闪电', icon: LightningIcon },
    { id: 'distort', name: '扭曲', icon: DistortIcon },
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
  const [cracks, setCracks] = useState<Crack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [isHoveringFace, setIsHoveringFace] = useState<boolean>(false);

  const [coins, setCoins] = useState<number>(480);
  const [hitCount, setHitCount] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<ToolId>('mallet');
  const [strength, setStrength] = useState<number>(50);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderInfo = useRef({ offsetX: 0, offsetY: 0, finalWidth: 1, finalHeight: 1 });

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
    setCracks([]);
    setIsLoading(false);
    setError(null);
    setIsHoveringFace(false);
    setMousePosition(null);
    setHitCount(0);
    setCoins(480); // Reset coins to initial value
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [imageSrc]);
  
  const resetEffects = useCallback(() => {
    setDents([]);
    setSpiders([]);
    setNeedles([]);
    setBruises([]);
    setCracks([]);
    setHitCount(0);
  }, []);

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

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;

    if (!ctx || !canvas || !image || !image.complete || image.naturalWidth === 0) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;

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
    ctx.drawImage(image, offsetX, offsetY, finalWidth, finalHeight);

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

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(needle.rotation);
        
        ctx.strokeStyle = '#a1a1aa';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, headRadius * 0.8);
        ctx.lineTo(0, length);
        ctx.stroke();

        ctx.shadowColor = 'transparent';

        ctx.fillStyle = needle.color;
        ctx.beginPath();
        ctx.arc(0, 0, headRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        const gradient = ctx.createRadialGradient(
            -headRadius * 0.4, -headRadius * 0.4, 0,
            -headRadius * 0.4, -headRadius * 0.4, headRadius * 1.5
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, headRadius, 0, 2 * Math.PI);
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

    cracks.forEach(crack => {
      const originX = offsetX + crack.x * finalWidth;
      const originY = offsetY + crack.y * finalHeight;
      
      let seed = crack.seed;
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      const maxSegments = 12 + Math.floor(crack.strength / 8);
      const initialLength = (0.02 + (crack.strength / 100) * 0.08) * Math.min(finalWidth, finalHeight);
      const initialWidth = 1 + (crack.strength / 100) * 5;
      const branchProbability = 0.3 + crack.strength / 250;
      
      const segments: {x1: number, y1: number, x2: number, y2: number, width: number, life: number}[] = [];
      const queue = [{
        x: originX,
        y: originY,
        angle: crack.initialAngle,
        length: initialLength,
        width: initialWidth,
        life: 1.0
      }];
      
      let segmentsCreated = 0;
      while(queue.length > 0 && segmentsCreated < maxSegments) {
        const current = queue.shift()!;
        
        const angleJitter = (random() - 0.5) * 1.0;
        const nextAngle = current.angle + angleJitter;
        const nextLength = current.length * (0.85 + random() * 0.15);
        
        const nextX = current.x + Math.cos(nextAngle) * current.length;
        const nextY = current.y + Math.sin(nextAngle) * current.length;

        segments.push({x1: current.x, y1: current.y, x2: nextX, y2: nextY, width: current.width, life: current.life});
        segmentsCreated++;

        if (nextLength > 2) {
          queue.push({
            x: nextX,
            y: nextY,
            angle: nextAngle,
            length: nextLength,
            width: current.width * 0.9,
            life: current.life * 0.95
          });
        }
        
        if (random() < branchProbability && nextLength > 5) {
          const branchAngle = nextAngle + (random() > 0.5 ? 1 : -1) * (Math.PI / 3 + (random() - 0.5) * 0.4);
           queue.push({
            x: nextX,
            y: nextY,
            angle: branchAngle,
            length: nextLength * 0.5,
            width: current.width * 0.6,
            life: current.life * 0.9
          });
        }
      }

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Pass 1: The main, wide, soft indentation (sunken look).
      ctx.globalCompositeOperation = 'multiply';
      segments.forEach(seg => {
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.strokeStyle = `rgba(80, 50, 40, ${0.35 * seg.life})`;
        ctx.lineWidth = seg.width * 2.5;
        ctx.stroke();
      });

      // Pass 2: The raised, dry edges (3D effect).
      ctx.globalCompositeOperation = 'soft-light';
      segments.forEach(seg => {
        const angle = Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
        const offsetX = Math.sin(angle) * (seg.width * 0.7);
        const offsetY = -Math.cos(angle) * (seg.width * 0.7);
        
        ctx.beginPath();
        ctx.moveTo(seg.x1 + offsetX, seg.y1 + offsetY);
        ctx.lineTo(seg.x2 + offsetX, seg.y2 + offsetY);
        ctx.moveTo(seg.x1 - offsetX, seg.y1 - offsetY);
        ctx.lineTo(seg.x2 - offsetX, seg.y2 - offsetY);
        
        ctx.strokeStyle = `rgba(255, 240, 230, ${0.4 * seg.life})`;
        ctx.lineWidth = seg.width * 1.2;
        ctx.stroke();
      });

      // Pass 3: The deep, central fissure (sharp definition).
      ctx.globalCompositeOperation = 'multiply';
      segments.forEach(seg => {
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.strokeStyle = `rgba(50, 25, 15, ${0.7 * seg.life})`;
        ctx.lineWidth = seg.width * 0.5;
        ctx.stroke();
      });

      ctx.restore();
    });

  }, [dents, spiders, needles, bruises, cracks]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || !imageSrc) return;
    const handleLoad = () => redrawCanvas();
    if (image.complete) handleLoad();
    else image.addEventListener('load', handleLoad);
    return () => image.removeEventListener('load', handleLoad);
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
    setCracks([]);
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

  useEffect(() => {
    if (imageFile) runFaceDetection(imageFile);
  }, [imageFile, runFaceDetection]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
      setImageFile(file);
      setImageSrc(URL.createObjectURL(file));
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

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPosOnImage(event);
    if (!pos || !imageSrc || isLoading) return;
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    let canHit = false;
    if (faceBox) {
        const { x, y } = pos;
        const { x: faceX, y: faceY, width: faceW, height: faceH } = faceBox;
        if (x >= faceX && x <= faceX + faceW && y >= faceY && y <= faceY + faceH) {
            canHit = true;
        }
    } else {
        canHit = true; 
    }
    
    if (!canHit) return;

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
    } else if (activeTool === 'crack') {
        const newCrack: Crack = {
            id: performance.now(),
            x: pos.x,
            y: pos.y,
            strength: strength,
            seed: Math.random(),
            initialAngle: Math.random() * Math.PI * 2,
        };
        setCracks(prev => [...prev, newCrack]);
        setHitCount(prev => prev + 1);
        setCoins(prev => prev + 5);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });

    if (activeTool !== 'mallet') {
      setIsHoveringFace(false);
      return;
    }

    const pos = getPosOnImage(event);
    if (pos && (faceBox || !isLoading)) {
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
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  
  const getCursor = () => {
      if (activeTool === 'mallet' && isHoveringFace) return 'none';
      if ((activeTool === 'voodooSpider' || activeTool === 'voodooNeedle' || activeTool === 'fistPunch' || activeTool === 'crack') && imageSrc) return 'crosshair';
      return 'default';
  }

  const ToolButton: React.FC<{tool: typeof tools[number]}> = ({ tool }) => {
    const isActive = activeTool === tool.id;
    return (
        <button
            onClick={() => setActiveTool(tool.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 aspect-square ${
                isActive ? 'bg-yellow-500 text-slate-900 shadow-lg' : 'bg-slate-700/50 hover:bg-slate-600/50'
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
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => { setIsHoveringFace(false); setMousePosition(null); }}
                      style={{ cursor: getCursor() }}
                    >
                        <img ref={imageRef} src={imageSrc} alt="Uploaded" className="w-full h-full object-contain block opacity-0 pointer-events-none" />
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" onClick={handleCanvasClick} />
                        <AnimatedMalletCursor position={mousePosition} visible={isHoveringFace} />
                        
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                                <SpinnerIcon className="w-12 h-12 text-yellow-400" />
                                <p className="mt-4 text-lg font-semibold animate-pulse">Detecting face...</p>
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
                    disabled={dents.length === 0 && spiders.length === 0 && needles.length === 0 && bruises.length === 0 && cracks.length === 0}
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
