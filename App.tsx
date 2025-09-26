
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaceBoundingBox, Dent } from './types';
import { detectFace } from './services/geminiService';
import { MalletIcon, SpinnerIcon, UploadIcon } from './components/icons';

// A new component for the animated cursor
const AnimatedMalletCursor: React.FC<{ position: { x: number, y: number } | null, visible: boolean }> = ({ position, visible }) => {
  if (!visible || !position) {
    return null;
  }
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: position.x, top: position.y, transform: 'translate(-10px, -30px)' }}
    >
      <style>
        {`
          @keyframes wobble {
            0%, 100% { transform: rotate(-55deg); }
            50% { transform: rotate(-35deg); }
          }
        `}
      </style>
      <MalletIcon
        className="w-10 h-10 text-yellow-400 drop-shadow-lg"
        style={{ animation: 'wobble 0.5s ease-in-out infinite' }}
      />
    </div>
  );
};


const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [faceBox, setFaceBox] = useState<FaceBoundingBox | null>(null);
  const [dents, setDents] = useState<Dent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [isHoveringFace, setIsHoveringFace] = useState<boolean>(false);

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
    setIsLoading(false);
    setError(null);
    setIsHoveringFace(false);
    setMousePosition(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [imageSrc]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;

    if (!ctx || !canvas || !image || !image.complete || image.naturalWidth === 0) {
      return;
    }
    
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
    const animationDuration = 500; // 0.5 seconds

    dents.forEach(dent => {
      const centerX = offsetX + dent.x * finalWidth;
      const centerY = offsetY + dent.y * finalHeight;
      const radius = dent.radius * Math.min(finalWidth, finalHeight);

      // Draw the static dent
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
      
      // Draw the ripple animation
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
  }, [dents]);

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
  
  // This effect runs the animation loop ONLY when necessary.
  useEffect(() => {
    let animationFrameId: number;
    
    const needsAnimation = dents.some(d => (performance.now() - d.createdAt) < 500);

    if (!needsAnimation) {
        return; // No animation needed, exit.
    }
    
    const animate = () => {
        redrawCanvas();
        const stillAnimating = dents.some(d => (performance.now() - d.createdAt) < 500);
        if (stillAnimating) {
            animationFrameId = requestAnimationFrame(animate);
        }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [dents, redrawCanvas]);

  const runFaceDetection = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFaceBox(null);
    setDents([]);

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
      if (detectedFace) {
        setFaceBox(detectedFace);
      } else {
        setError('No face detected or an error occurred. Please try another image.');
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
        setError("Failed to read file.");
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (imageFile) {
        runFaceDetection(imageFile);
    }
  }, [imageFile, runFaceDetection]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
      
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
    
    if (mouseX < offsetX || mouseX > offsetX + finalWidth || mouseY < offsetY || mouseY > offsetY + finalHeight) {
      return null;
    }
    
    const x = (mouseX - offsetX) / finalWidth;
    const y = (mouseY - offsetY) / finalHeight;
    
    return { x, y, absoluteX: mouseX, absoluteY: mouseY };
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPosOnImage(event);
    const ctx = canvasRef.current?.getContext('2d');
    if (!pos || !faceBox || !ctx) return;

    const { x, y } = pos;
    const { x: faceX, y: faceY, width: faceW, height: faceH } = faceBox;

    if (x >= faceX && x <= faceX + faceW && y >= faceY && y <= faceY + faceH) {
        const pixelData = ctx.getImageData(pos.absoluteX, pos.absoluteY, 1, 1).data;
        const [r, g, b] = pixelData;

        const shadowColor = `rgba(${Math.max(0, r-50)}, ${Math.max(0, g-50)}, ${Math.max(0, b-50)}, 0.5)`;
        const highlightColor = `rgba(${Math.min(255, r+50)}, ${Math.min(255, g+50)}, ${Math.min(255, b+50)}, 0.5)`;
        
      const newDent: Dent = {
        x,
        y,
        radius: (Math.random() * 0.03) + 0.02,
        rotation: Math.random() * Math.PI * 2,
        shadowColor,
        highlightColor,
        createdAt: performance.now(),
      };
      setDents(prevDents => [...prevDents, newDent]);
    }
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    
    const pos = getPosOnImage(event);
    if (pos && faceBox) {
      const { x, y } = pos;
      const { x: faceX, y: faceY, width: faceW, height: faceH } = faceBox;
      setIsHoveringFace(x >= faceX && x <= faceX + faceW && y >= faceY && y <= faceY + faceH);
    } else {
      setIsHoveringFace(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 flex items-center gap-3 justify-center">
            <MalletIcon className="w-10 h-10 -rotate-45" />
            Face Mallet
          </h1>
          <p className="text-slate-400 mt-2">Upload a photo, we'll find the face. Then, let the hammering begin!</p>
        </header>

        <main className="w-full bg-slate-800/50 rounded-2xl shadow-2xl shadow-slate-950/50 p-4 md:p-8 flex flex-col items-center border border-slate-700">
          {!imageSrc ? (
             <div className="w-full flex flex-col items-center justify-center h-80 border-2 border-dashed border-slate-600 rounded-lg text-center p-8">
                <UploadIcon className="w-16 h-16 text-slate-500 mb-4"/>
                <h2 className="text-xl font-semibold text-slate-300">Upload Your Image</h2>
                <p className="text-slate-400 mb-6">Click the button below to select a picture.</p>
                <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                <button onClick={triggerFileInput} className="px-6 py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors duration-300 shadow-lg hover:shadow-yellow-500/30">
                    Select Photo
                </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
                <div 
                  className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg bg-slate-900/50"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setIsHoveringFace(false)}
                  style={{ cursor: isHoveringFace ? 'none' : 'default' }}
                >
                    <img ref={imageRef} src={imageSrc} alt="Uploaded" className="w-full h-auto object-contain block opacity-0 pointer-events-none" />
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" onClick={handleCanvasClick} />
                    <AnimatedMalletCursor position={mousePosition} visible={isHoveringFace} />
                    
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                            <SpinnerIcon className="w-12 h-12 text-yellow-400" />
                            <p className="mt-4 text-lg font-semibold animate-pulse">Detecting face...</p>
                        </div>
                    )}
                    
                    {faceBox && !isLoading && (
                       <div
                         className="absolute border-4 border-yellow-400/80 rounded-md pointer-events-none"
                         style={{
                           left: `${renderInfo.current.offsetX + faceBox.x * renderInfo.current.finalWidth}px`,
                           top: `${renderInfo.current.offsetY + faceBox.y * renderInfo.current.finalHeight}px`,
                           width: `${faceBox.width * renderInfo.current.finalWidth}px`,
                           height: `${faceBox.height * renderInfo.current.finalHeight}px`,
                           opacity: dents.length > 0 ? 0 : 1,
                           transition: 'opacity 0.5s, left 0.2s, top 0.2s, width 0.2s, height 0.2s',
                           boxShadow: '0 0 20px rgba(250, 204, 21, 0.5)'
                         }}
                       />
                    )}
                </div>

                <div className="mt-6 text-center w-full">
                    {error && <p className="text-red-400 bg-red-900/50 px-4 py-2 rounded-md mb-4">{error}</p>}
                    <button onClick={resetState} className="px-6 py-3 bg-slate-700 text-slate-200 font-bold rounded-lg hover:bg-slate-600 transition-colors duration-300">
                       Upload Another
                    </button>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;