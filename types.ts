
export interface FaceBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dent {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  shadowColor: string;
  highlightColor: string;
  createdAt: number;
}

export interface Spider {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  targetX: number;
  targetY: number;
  createdAt: number;
}

export interface Needle {
  x: number;
  y: number;
  length: number;
  rotation: number;
  color: string;
}

export interface Bruise {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  intensity: number; // 0 to 1
  aspectRatio: number;
}

export interface Swelling {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  aspectRatio: number;
  rotation: number;
  createdAt: number;
}

export interface SlapAnimation {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  createdAt: number;
}

export interface SlipperAnimation {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  createdAt: number;
  totalSlaps: number;
}
