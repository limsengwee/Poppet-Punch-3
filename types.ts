
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

export interface ImageDimensions {
    width: number;
    height: number;
}