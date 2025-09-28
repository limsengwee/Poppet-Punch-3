
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaceBoundingBox, Dent, Spider, Needle, Bruise, Swelling, SlapAnimation, ClogAnimation } from './types';
import { detectFace, applyGenerativeImageEffect } from './services/geminiService';
import { 
    MalletIcon, SpinnerIcon, UploadIcon, CameraIcon, CoinIcon, HandIcon, VoodooNeedleIcon, SpiderIcon, BlisterIcon, SkullIcon, RestartIcon, BroomIcon, CrackIcon, UglyIcon, ClogIcon
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
    { id: 'fistPunch', name: '水泡', icon: BlisterIcon },
    { id: 'voodooSpider', name: '巫毒蜘蛛', icon: SpiderIcon },
    { id: 'voodooNeedle', name: '巫毒针', icon: VoodooNeedleIcon },
    { id: 'shatter', name: '碎裂', icon: CrackIcon },
    { id: 'ugly', name: '丑化', icon: UglyIcon },
    { id: 'skull', name: '骷髅', icon: SkullIcon },
    { id: 'clogStrike', name: '木屐攻击', icon: ClogIcon },
];

type ToolId = typeof tools[number]['id'];

const CLOG_IMAGE_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADGCAMAAAAWM/3WAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAPUExURf8AAAD/AAD/AAAA////N6TVyAAAAAJ0Uk5T/wDltzBKAAACyElEQVR42u3d246rIBBENcr//7rLElpa0m7YpG6bJ+PcpA4C0Y0DAAAAAAAAAAAAAADAb3K6rQ3+a/PSd6v1nL5w+n1Z/TrN1+vN2llhJ5/b2rN2hV3/5y8oV/b5zVl5tW/22t/3uDKz3y2Zo4Vn/P742u0G61P7JgOfV6z5o0S+f1V5kMvX+Vbv89N3Z32+4fX/m/5y/fN3wF+tU97f26z0f0H580Gg8/X63S6/T/j/AHD148R9/bI/f0x/P61/b/1oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AuDrx8R9/bI/v0x/f23/b/3oAfsLgK8fE/f1y/78Mv39tf2/9aAH7C8Avn5M3Ncv+/PL9PfX9v/WgR+wv8D4+jFxX7/szy/T31/b/1oHfsL+AvBHwV+Qz0Gj4QAAAABJRU5ErkJggg==';

// Fix: Replaced the very large, corrupted Base64 audio string with a smaller, valid one to fix the parsing error.
const CLOG_STRIKE_AUDIO_DATA_URL = 'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAAAAAASWvoQk7m1lI18A0L19g7f8A/wAEbhmMSUpCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkL/8Yxg4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADSAAAAAAE1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MYxBQBAAAAASWvoQk7m1lI18A0L19g7f8A/wAEbhmMSUpCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkL/8Yxg4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADSAAAAAAE1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export const App: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string | null>(null);
    const [faceBox, setFaceBox] = useState<FaceBoundingBox | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<ToolId>('mallet');
    const [strength, setStrength] = useState(50);
    const [dents, setDents] = useState<Dent[]>([]);
    const [spiders, setSpiders] = useState<Spider[]>([]);
    const [needles, setNeedles] = useState<Needle[]>([]);
    const [bruises, setBruises] = useState<Bruise[]>([]);
    const [swellings, setSwellings] = useState<Swelling[]>([]);
    const [slapAnimations, setSlapAnimations] = useState<SlapAnimation[]>([]);
    const [clogAnimations, setClogAnimations] = useState<ClogAnimation[]>([]);
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);
    const [nonDestructiveEffects, setNonDestructiveEffects] = useState<any>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const animationFrameRef = useRef<number>();
    const [clogAudioBuffer, setClogAudioBuffer] = useState<AudioBuffer | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const clearAllEffects = useCallback(() => {
        setDents([]);
        setSpiders([]);
        setNeedles([]);
        setBruises([]);
        setSwellings([]);
        setSlapAnimations([]);
        setClogAnimations([]);
    }, []);

    const resetImage = useCallback(() => {
        if (originalImage) {
            setImage(originalImage);
            clearAllEffects();
        }
    }, [originalImage, clearAllEffects]);

    const backupNonDestructiveEffects = useCallback(() => {
        setNonDestructiveEffects({
            dents: [...dents],
            spiders: [...spiders],
            needles: [...needles],
            bruises: [...bruises],
            swellings: [...swellings],
        });
        clearAllEffects();
    }, [dents, spiders, needles, bruises, swellings, clearAllEffects]);

    const restoreNonDestructiveEffects = useCallback(() => {
        if (nonDestructiveEffects) {
            setDents(nonDestructiveEffects.dents);
            setSpiders(nonDestructiveEffects.spiders);
            setNeedles(nonDestructiveEffects.needles);
            setBruises(nonDestructiveEffects.bruises);
            setSwellings(nonDestructiveEffects.swellings);
        }
    }, [nonDestructiveEffects]);

    const handleImageUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError("Please upload a valid image file.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const dataUrl = `data:${file.type};base64,${base64String}`;
            
            setImage(dataUrl);
            setOriginalImage(dataUrl);
            setImageMimeType(file.type);
            clearAllEffects();
            setFaceBox(null);
            setError(null);
            setIsLoading(true);
            setLoadingMessage('Detecting face...');
            
            try {
                const box = await detectFace(base64String, file.type);
                if (box) {
                    setFaceBox(box);
                } else {
                    setError("Could not detect a face in the image. Please try another one.");
                }
            } catch (err) {
                setError("An error occurred during face detection.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            setError("Failed to read the image file.");
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };
    
    const applyAiEffect = useCallback(async (prompt: string) => {
        if (!image || !imageMimeType) return;

        setIsLoading(true);
        setLoadingMessage('Applying AI magic...');
        backupNonDestructiveEffects();

        try {
            const base64Data = image.split(',')[1];
            const resultBase64 = await applyGenerativeImageEffect(base64Data, imageMimeType, prompt);

            if (resultBase64) {
                const newDataUrl = `data:${imageMimeType};base64,${resultBase64}`;
                setImage(newDataUrl);
                restoreNonDestructiveEffects();
            } else {
                 setError("The AI couldn't apply the effect. It might be too complex. Please try again or adjust the strength.");
                 restoreNonDestructiveEffects();
            }
        } catch (err) {
            console.error(err);
            setError("Failed to apply AI image effect.");
            restoreNonDestructiveEffects();
        } finally {
            setIsLoading(false);
        }
    }, [image, imageMimeType, backupNonDestructiveEffects, restoreNonDestructiveEffects]);

    useEffect(() => {
        const initAudio = async () => {
            if (!audioContextRef.current) {
                try {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                } catch (e) {
                    console.error("Web Audio API is not supported in this browser");
                    return;
                }
            }
            const audioContext = audioContextRef.current;
            
            try {
                const response = await fetch(CLOG_STRIKE_AUDIO_DATA_URL);
                const arrayBuffer = await response.arrayBuffer();
                audioContext.decodeAudioData(arrayBuffer, 
                    (buffer) => { setClogAudioBuffer(buffer); }, 
                    (error) => { console.error('Error decoding audio data:', error); }
                );
            } catch (error) {
                console.error('Failed to fetch or decode audio data:', error);
            }
        };
        initAudio();
    }, []);

    const drawClog = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
        const clogImg = new Image();
        clogImg.src = CLOG_IMAGE_DATA_URL;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(-1, 1);
        ctx.drawImage(clogImg, -size / 2, -size / 2, size, size);
        ctx.restore();
    };
    
    const playClogSound = useCallback((strength: number) => {
        if (!clogAudioBuffer || !audioContextRef.current) {
            return;
        }

        try {
            const audioContext = audioContextRef.current;
            const source = audioContext.createBufferSource();
            source.buffer = clogAudioBuffer;
            
            const gainNode = audioContext.createGain();
            const volume = 0.2 + (strength / 100) * 0.8;
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            source.start(0);
        } catch (e) {
            console.error("Audio play failed:", e);
        }
    }, [clogAudioBuffer]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const now = Date.now();

        switch (selectedTool) {
            case 'clogStrike': {
                const size = 100 + (strength / 100) * 150;
                const totalSlaps = 2 + Math.floor((strength / 100) * 8);
                setClogAnimations(prev => [...prev, { id: now, x, y, size, rotation: Math.random() * 2 * Math.PI, createdAt: now, totalSlaps }]);
                playClogSound(strength);
                break;
            }
            case 'mallet':
                const radius = 20 + (strength / 100) * 40;
                const shadowColor = `rgba(0, 0, 0, ${0.3 + (strength / 100) * 0.4})`;
                const highlightColor = `rgba(255, 255, 255, ${0.1 + (strength / 100) * 0.2})`;
                setDents(prev => [...prev, { x, y, radius, rotation: Math.random() * Math.PI * 2, shadowColor, highlightColor, createdAt: now }]);
                break;
            case 'voodooSpider':
                const spiderSize = 20 + (strength / 100) * 60;
                setSpiders(prev => [...prev, { 
                    id: now, 
                    x, 
                    y, 
                    size: spiderSize, 
                    rotation: Math.random() * Math.PI * 2, 
                    speed: 0.5 + Math.random() * 1.5,
                    targetX: x,
                    targetY: y,
                    createdAt: now 
                }]);
                break;
            case 'voodooNeedle':
                 const length = 50 + (strength / 100) * 100;
                 const colors = ['#c0c0c0', '#d4af37', '#b08d57', '#a9a9a9'];
                 setNeedles(prev => [...prev, {
                     x, y, length,
                     rotation: Math.random() * Math.PI * 2,
                     color: colors[Math.floor(Math.random() * colors.length)]
                 }]);
                 break;
             case 'fistPunch':
                const bruiseRadius = 25 + (strength / 100) * 50;
                setBruises(prev => [...prev, {
                    x, y,
                    radius: bruiseRadius,
                    rotation: Math.random() * Math.PI * 2,
                    intensity: strength / 100,
                    aspectRatio: 1 + Math.random() * 0.5,
                }]);
                break;
            case 'hand': {
                const size = 100 + (strength / 100) * 150;
                setSlapAnimations(prev => [...prev, { id: now, x, y, size, rotation: Math.random() * Math.PI * 2, createdAt: now }]);
                break;
            }
        }
    };
    
    useEffect(() => {
        if(selectedTool === 'skull' || selectedTool === 'shatter' || selectedTool === 'ugly') {
            let prompt = '';
            if (selectedTool === 'skull') {
                prompt = `Analyze the person's face in the image and transform it into a photorealistic human skull. The transformation should cover approximately ${strength}% of the face area, starting from the center and blending outwards. Keep the original hair, ears, neck, and background intact. The result should look like the skin is peeling away to reveal a realistic skull underneath, not a cartoon or fantasy skull.`;
            } else if (selectedTool === 'shatter') {
                prompt = `Create a photorealistic "shattered glass" effect over the person's face. The density and size of the cracks should correspond to a strength of ${strength} out of 100. At ${strength}, the face should be heavily fractured but still recognizable. Do not alter the background.`;
            } else if (selectedTool === 'ugly') {
                prompt = `Make the person in the image look ugly and evil, corresponding to a strength of ${strength} on a scale of 1 to 100. Do NOT make them smile. The expression should always be negative, menacing, or monstrous.
                - At strength 1, the effect should be very subtle: a slight sneer, menacing eyes, or slightly unsettling features.
                - At strength 25, introduce minor grotesque features: a crooked nose, yellowish teeth, slight skin blemishes, a more pronounced menacing expression.
                - At strength 50, the features should be moderately ugly: more significant facial asymmetry, blotchy or scarred skin, a menacing grimace, and angrier eyes.
                - At strength 75, the transformation is significant: noticeably distorted features, perhaps one eye is discolored or misshapen, skin has warts or lesions, teeth are broken or missing.
                - At strength 100, the face should be monstrous and horrifying: extreme disfigurement, non-human elements like small horns or reptilian skin textures, glowing red eyes, and a truly terrifying expression.
                The transformation should be photorealistic and confined to the face and skin, leaving hair and background untouched.`;
            }
            applyAiEffect(prompt);
        }
    }, [selectedTool, strength, applyAiEffect]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        if (!canvas || !ctx || !img) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const now = Date.now();
        const DENT_FADE_DURATION = 1500;
        const SPIDER_FADE_DURATION = 2000;
        const SWELLING_FADE_IN_DURATION = 300;
        const SLAP_ANIMATION_DURATION = 500;
        const CLOG_SLAP_INTERVAL = 100;
        
        // --- Clog Strike Animation ---
        setClogAnimations(prev => {
            const updated = prev.filter(anim => {
                const elapsedTime = now - anim.createdAt;
                const totalDuration = anim.totalSlaps * CLOG_SLAP_INTERVAL;
                return elapsedTime < totalDuration;
            });

            updated.forEach(anim => {
                const elapsedTime = now - anim.createdAt;
                const currentSlap = Math.floor(elapsedTime / CLOG_SLAP_INTERVAL);
                
                // Play sound for the current slap if it's new
                if (currentSlap > (Math.floor((elapsedTime - 16) / CLOG_SLAP_INTERVAL))) {
                    playClogSound(strength);
                }

                const phase = (elapsedTime % CLOG_SLAP_INTERVAL) / CLOG_SLAP_INTERVAL;
                const animProgress = phase < 0.5 ? phase * 2 : (1 - phase) * 2; // 0 -> 1 -> 0
                
                const currentX = anim.x + Math.sin(anim.rotation + currentSlap) * 20 * (1 - animProgress);
                const currentY = anim.y + Math.cos(anim.rotation + currentSlap) * 20 * (1 - animProgress);
                const currentSize = anim.size * (0.8 + animProgress * 0.2);
                
                drawClog(ctx, currentX, currentY, currentSize, anim.rotation);
            });
            return updated;
        });

        // --- Hand Slap Animation ---
        setSlapAnimations(prev => {
            const updated = prev.filter(anim => now - anim.createdAt < SLAP_ANIMATION_DURATION + SWELLING_FADE_IN_DURATION);

            updated.forEach(anim => {
                const elapsedTime = now - anim.createdAt;
                if (elapsedTime < SLAP_ANIMATION_DURATION) {
                     const phase = elapsedTime / SLAP_ANIMATION_DURATION; // 0 to 1
                     const animProgress = phase < 0.5 ? phase * 2 : (1 - phase) * 2; // 0 -> 1 -> 0
                     
                     const fromLeft = Math.sin(anim.rotation) > 0;
                     const startX = fromLeft ? -anim.size : canvas.width + anim.size;
                     const endX = anim.x;
                     const currentX = startX + (endX - startX) * animProgress;
 
                     ctx.save();
                     ctx.globalAlpha = animProgress > 0.5 ? 1 : animProgress * 2;
                     ctx.translate(currentX, anim.y);
                     ctx.rotate(anim.rotation);
                     ctx.scale(fromLeft ? 1 : -1, 1);
                     
                     // Draw Hand
                     ctx.fillStyle = '#C68642'; // A skin tone
                     ctx.beginPath();
                     ctx.roundRect(-anim.size/2, -anim.size/2, anim.size, anim.size, 20);
                     ctx.fill();

                     ctx.restore();

                    // Sound and Swelling logic
                    if (phase >= 0.48 && phase <= 0.52) {
                        if (!anim.soundPlayed) {
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            // Thump
                            const thump = audioContext.createOscillator();
                            const thumpGain = audioContext.createGain();
                            thump.type = 'sine';
                            const startPitch = 120 - (strength / 100) * 40;
                            thump.frequency.setValueAtTime(startPitch, audioContext.currentTime);
                            thump.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.15);
                            thumpGain.gain.setValueAtTime(1.0, audioContext.currentTime);
                            thumpGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                            thump.connect(thumpGain).connect(audioContext.destination);
                            thump.start();
                            thump.stop(audioContext.currentTime + 0.15);

                            // Crack
                            const crack = audioContext.createBufferSource();
                            const bufferSize = audioContext.sampleRate * 0.1;
                            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
                            const data = buffer.getChannelData(0);
                            for (let i = 0; i < bufferSize; i++) {
                                data[i] = Math.random() * 2 - 1;
                            }
                            crack.buffer = buffer;
                            const crackGain = audioContext.createGain();
                            const crackFilter = audioContext.createBiquadFilter();
                            crackFilter.type = 'highpass';
                            crackFilter.frequency.value = 2000 + (strength / 100) * 3000;
                            crackGain.gain.setValueAtTime(0.8, audioContext.currentTime);
                            crackGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                            crack.connect(crackGain).connect(crackFilter).connect(audioContext.destination);
                            crack.start();
                            crack.stop(audioContext.currentTime + 0.1);
                            
                            anim.soundPlayed = true;

                             setSwellings(prevSwellings => [...prevSwellings, {
                                x: anim.x,
                                y: anim.y,
                                radius: anim.size * 0.4,
                                intensity: strength / 100,
                                aspectRatio: 1.2,
                                rotation: anim.rotation,
                                createdAt: now
                            }]);
                        }
                    }
                }
            });
            return updated;
        });

        // --- Swelling Effect ---
        setSwellings(prev => {
            return prev.filter(swelling => {
                const age = now - swelling.createdAt;
                if (age > 10000) return false; // Fade out after 10 seconds

                const fadeInProgress = Math.min(1, age / SWELLING_FADE_IN_DURATION);
                const fadeOutProgress = age > 8000 ? Math.max(0, 1 - (age - 8000) / 2000) : 1;
                const alpha = fadeInProgress * fadeOutProgress;
                if (alpha <= 0) return false;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(swelling.x, swelling.y);
                ctx.rotate(swelling.rotation);
                ctx.scale(swelling.aspectRatio, 1);

                const radius = swelling.radius;
                const intensity = swelling.intensity;
                
                // Layer 1: Base redness
                const grad1 = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
                grad1.addColorStop(0, `rgba(220, 0, 0, ${0.1 * intensity})`);
                grad1.addColorStop(1, `rgba(255, 100, 100, 0)`);
                ctx.fillStyle = grad1;
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
                
                // Layer 2: Deeper center
                const grad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.8);
                grad2.addColorStop(0, `rgba(200, 0, 0, ${0.25 * intensity})`);
                grad2.addColorStop(1, 'rgba(200, 0, 0, 0)');
                ctx.fillStyle = grad2;
                ctx.globalCompositeOperation = 'soft-light';
                ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

                // Layer 3: Highlight for swelling effect
                const grad3 = ctx.createRadialGradient(0, -radius * 0.2, 0, 0, 0, radius);
                grad3.addColorStop(0, `rgba(255, 255, 255, ${0.2 * intensity})`);
                grad3.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad3;
                ctx.globalCompositeOperation = 'soft-light';
                ctx.fillRect(-radius, -radius, radius*2, radius*2);

                // Layer 4: Mottled darker spots
                const grad4 = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
                grad4.addColorStop(0, `rgba(100, 0, 0, ${0.15 * intensity})`);
                grad4.addColorStop(1, 'rgba(100, 0, 0, 0)');
                ctx.fillStyle = grad4;
                ctx.globalCompositeOperation = 'color-burn';
                ctx.filter = 'blur(5px)';
                ctx.fillRect(-radius, -radius, radius * 2, radius * 2);

                ctx.restore();
                return true;
            });
        });
        
        // --- Bruise Effect ---
        bruises.forEach(bruise => {
            ctx.save();
            ctx.translate(bruise.x, bruise.y);
            ctx.rotate(bruise.rotation);
            ctx.scale(bruise.aspectRatio, 1);
            
            const radius = bruise.radius;
            const intensity = bruise.intensity;

            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            gradient.addColorStop(0, `rgba(10, 0, 40, ${0.4 * intensity})`);
            gradient.addColorStop(0.3, `rgba(90, 0, 60, ${0.3 * intensity})`);
            gradient.addColorStop(0.6, `rgba(255, 220, 120, ${0.2 * intensity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.globalCompositeOperation = 'multiply';
            ctx.beginPath();
            ctx.ellipse(0, 0, radius, radius, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.restore();
        });
        
        // --- Voodoo Needle Effect ---
        needles.forEach(needle => {
            const headRadius = needle.length * 0.08;
            
            ctx.save();
            ctx.translate(needle.x, needle.y);
            ctx.rotate(needle.rotation);

            // Puncture wound effect
            const woundRadius = headRadius * 0.7;
            const woundGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, woundRadius);
            woundGradient.addColorStop(0, 'rgba(50, 0, 0, 0.6)');
            woundGradient.addColorStop(0.7, 'rgba(100, 0, 0, 0.4)');
            woundGradient.addColorStop(1, 'rgba(150, 50, 50, 0)');
            ctx.fillStyle = woundGradient;
            ctx.beginPath();
            ctx.arc(0, 0, woundRadius, 0, Math.PI * 2);
            ctx.fill();

            // Needle Shaft
            const shaftLength = needle.length;
            const shaftWidth = needle.length * 0.03;
            const shaftGradient = ctx.createLinearGradient(0, -shaftWidth/2, 0, shaftWidth/2);
            shaftGradient.addColorStop(0, '#ffffff');
            shaftGradient.addColorStop(0.3, '#c0c0c0');
            shaftGradient.addColorStop(0.7, '#808080');
            shaftGradient.addColorStop(1, '#606060');

            ctx.fillStyle = shaftGradient;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillRect(0, -shaftWidth / 2, shaftLength, shaftWidth);
            
            // Needle Head
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 8;
            ctx.fillStyle = needle.color;
            ctx.beginPath();
            ctx.arc(shaftLength, 0, headRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // --- Voodoo Spider Effect ---
        setSpiders(prevSpiders => {
            return prevSpiders.map(spider => {
                const age = now - spider.createdAt;
                if (age > 10000) return { ...spider, createdAt: 0 }; // Mark for removal

                if (faceBox && canvas) {
                    const fb = {
                        x: faceBox.x * canvas.width,
                        y: faceBox.y * canvas.height,
                        width: faceBox.width * canvas.width,
                        height: faceBox.height * canvas.height
                    };
                    const distToTarget = Math.hypot(spider.targetX - spider.x, spider.targetY - spider.y);
                    if (distToTarget < 10) {
                        spider.targetX = fb.x + Math.random() * fb.width;
                        spider.targetY = fb.y + Math.random() * fb.height;
                    }

                    const angleToTarget = Math.atan2(spider.targetY - spider.y, spider.targetX - spider.x);
                    spider.x += Math.cos(angleToTarget) * spider.speed;
                    spider.y += Math.sin(angleToTarget) * spider.speed;
                    spider.rotation = angleToTarget + Math.PI / 2;
                }

                ctx.save();
                let alpha = 1;
                if (age < SPIDER_FADE_DURATION) {
                    alpha = age / SPIDER_FADE_DURATION;
                } else if (age > 8000) {
                    alpha = 1 - (age - 8000) / 2000;
                }
                ctx.globalAlpha = Math.max(0, alpha);
                ctx.translate(spider.x, spider.y);
                ctx.rotate(spider.rotation);
                
                // Simple spider drawing
                const bodyRadius = spider.size * 0.3;
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Legs
                ctx.strokeStyle = '#1a1a1a';
                ctx.lineWidth = spider.size * 0.05;
                for (let i = 0; i < 8; i++) {
                    const angle = (i * 0.8) - 2.8;
                    const side = (i < 4) ? -1 : 1;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(side * spider.size * 0.4, spider.size * (0.1 * i - 0.2));
                    ctx.lineTo(side * spider.size * 0.6, spider.size * (0.1 * i - 0.1));
                    ctx.stroke();
                }

                ctx.restore();
                return spider;
            }).filter(s => s.createdAt > 0);
        });

        // --- Mallet Dent Effect ---
        dents.forEach(dent => {
            const age = now - dent.createdAt;
            const progress = Math.min(age / DENT_FADE_DURATION, 1);
            if (progress >= 1) return;

            const alpha = 1 - progress;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(dent.x, dent.y);
            ctx.rotate(dent.rotation);
            
            // Shadow
            const shadowGradient = ctx.createLinearGradient(-dent.radius, -dent.radius, dent.radius, dent.radius);
            shadowGradient.addColorStop(0, 'transparent');
            shadowGradient.addColorStop(1, dent.shadowColor);
            ctx.fillStyle = shadowGradient;
            ctx.fillRect(-dent.radius, -dent.radius, dent.radius * 2, dent.radius * 2);
            
            // Highlight
            const highlightGradient = ctx.createLinearGradient(dent.radius, dent.radius, -dent.radius, -dent.radius);
            highlightGradient.addColorStop(0, 'transparent');
            highlightGradient.addColorStop(1, dent.highlightColor);
            ctx.fillStyle = highlightGradient;
            ctx.fillRect(-dent.radius, -dent.radius, dent.radius * 2, dent.radius * 2);
            
            ctx.restore();
        });
        setDents(prevDents => prevDents.filter(d => (now - d.createdAt) < DENT_FADE_DURATION));
        
        animationFrameRef.current = requestAnimationFrame(draw);
    }, [image, faceBox, dents, spiders, needles, bruises, swellings, slapAnimations, clogAnimations, strength, playClogSound]);

    useEffect(() => {
        animationFrameRef.current = requestAnimationFrame(draw);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [draw]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setCursorPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    };

    const handleMouseLeave = () => {
      setCursorPos(null);
    };

    const getCursorClass = () => {
        if (!image) return 'cursor-default';
        switch (selectedTool) {
            case 'mallet': return 'cursor-none';
            case 'hand': return 'cursor-grab';
            case 'clogStrike': return 'cursor-grab';
            default: return 'cursor-crosshair';
        }
    };

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 font-sans">
          <header className="w-full text-center mb-4">
              <h1 className="text-4xl font-bold text-yellow-400" style={{ textShadow: '0 0 8px #facc15' }}>打小人! Poppet Punch!</h1>
              <p className="text-slate-400">An AI-powered stress relief tool. Upload a face and have fun!</p>
          </header>
  
          <main className="w-full max-w-7xl flex flex-col md:flex-row gap-6">
              {/* Left Panel: Image Display */}
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 rounded-lg p-4 border border-slate-700 min-h-[300px] md:min-h-[600px] relative overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                  {isLoading && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                          <SpinnerIcon className="w-12 h-12 text-yellow-400" />
                          <p className="mt-4 text-lg">{loadingMessage}</p>
                      </div>
                  )}
                  {error && (
                      <div className="absolute bottom-4 left-4 right-4 bg-red-800/90 text-white p-3 rounded-lg z-10 text-center">
                          {error}
                      </div>
                  )}
                  {!image ? (
                      <div className="text-center text-slate-400">
                          <UploadIcon className="w-24 h-24 mx-auto text-slate-500" />
                          <p className="mt-4 text-xl">Upload an image to get started</p>
                          <p>Or use your camera</p>
                          <div className="mt-6 flex items-center justify-center gap-4">
                                <label className="cursor-pointer bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors">
                                  <UploadIcon className="w-5 h-5" />
                                  Choose File
                                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors">
                                    <CameraIcon className="w-5 h-5" />
                                    Use Camera
                                </button>
                          </div>
                      </div>
                  ) : (
                      <div className={`relative ${getCursorClass()}`}>
                          <img ref={imageRef} src={image} alt="Uploaded face" className="max-w-full max-h-[80vh] object-contain rounded-md" style={{ display: 'none' }} onLoad={() => {
                              const canvas = canvasRef.current;
                              const img = imageRef.current;
                              if(canvas && img) {
                                  const aspectRatio = img.naturalWidth / img.naturalHeight;
                                  const maxWidth = canvas.parentElement?.clientWidth || 800;
                                  const maxHeight = window.innerHeight * 0.8;
                                  let width = maxWidth;
                                  let height = width / aspectRatio;
                                  if (height > maxHeight) {
                                    height = maxHeight;
                                    width = height * aspectRatio;
                                  }
                                  canvas.width = width;
                                  canvas.height = height;
                                  draw();
                              }
                          }}/>
                          <canvas ref={canvasRef} onClick={handleCanvasClick} className="rounded-md" />
                          {faceBox && (
                            <div className="absolute border-2 border-yellow-400 pointer-events-none" style={{
                                left: `${faceBox.x * 100}%`,
                                top: `${faceBox.y * 100}%`,
                                width: `${faceBox.width * 100}%`,
                                height: `${faceBox.height * 100}%`,
                                boxShadow: '0 0 15px #facc15'
                            }}></div>
                          )}
                          <AnimatedMalletCursor position={cursorPos} visible={selectedTool === 'mallet'} />
                      </div>
                  )}
              </div>
  
              {/* Right Panel: Toolbox */}
              <div className="w-full md:w-96 bg-slate-800/50 rounded-lg p-6 border border-slate-700 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-yellow-400">Toolbox</h2>
                    <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                        <CoinIcon className="w-6 h-6" />
                        <span className="font-bold text-lg">480</span>
                    </div>
                </div>

                 <div className="grid grid-cols-3 gap-4">
                      {tools.map(tool => (
                          <button 
                              key={tool.id} 
                              onClick={() => setSelectedTool(tool.id as ToolId)}
                              className={`p-3 aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200 gap-2 ${selectedTool === tool.id ? 'bg-yellow-500 text-slate-900 scale-105 shadow-lg shadow-yellow-500/20' : 'bg-slate-700 hover:bg-slate-600/70'}`}
                          >
                              <tool.icon className="w-10 h-10" />
                              <span className="text-sm font-semibold">{tool.name}</span>
                          </button>
                      ))}
                  </div>

                  <div className="flex-grow flex flex-col justify-end">
                      <div className="space-y-4">
                          <div>
                              <label htmlFor="strength" className="block mb-2 font-medium text-slate-300">Strength</label>
                              <input 
                                  id="strength" 
                                  type="range" 
                                  min="1" 
                                  max="100" 
                                  value={strength}
                                  onChange={(e) => setStrength(parseInt(e.target.value, 10))}
                                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" 
                                  style={{
                                      background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${strength}%, #475569 ${strength}%)`
                                  }}
                              />
                          </div>
                      </div>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4 flex gap-2">
                    <button onClick={resetImage} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center justify-center gap-2 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={!originalImage}>
                        <RestartIcon className="w-5 h-5"/>
                        Reset
                    </button>
                    <button onClick={clearAllEffects} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center justify-center gap-2 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={!image}>
                        <BroomIcon className="w-5 h-5"/>
                        Clean
                    </button>
                  </div>

                  <p className="text-center text-xs text-slate-500 pt-2">All tools are unlocked! Enjoy!</p>
              </div>
          </main>
      </div>
    );
  };
