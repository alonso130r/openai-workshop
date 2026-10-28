/**
 * ManimReact - Video Export System
 * Provides functionality to export animations as video files
 */

import type { ExportConfig, CameraConfig } from '../core/types';
import { DEFAULT_PIXEL_WIDTH, DEFAULT_PIXEL_HEIGHT, DEFAULT_FRAME_RATE } from '../core/constants';

export interface ExportProgress {
  /** Current frame being rendered */
  currentFrame: number;
  /** Total number of frames */
  totalFrames: number;
  /** Progress percentage (0-100) */
  percent: number;
  /** Current stage of export */
  stage: 'capturing' | 'encoding' | 'finalizing' | 'complete' | 'error';
  /** Status message */
  message: string;
}

export interface ExportResult {
  /** Whether export was successful */
  success: boolean;
  /** Blob containing the video file */
  blob?: Blob;
  /** URL for the video file (must be revoked after use) */
  url?: string;
  /** Error message if export failed */
  error?: string;
  /** Export duration in milliseconds */
  duration?: number;
  /** File size in bytes */
  fileSize?: number;
}

export interface VideoExporterOptions extends ExportConfig {
  /** Callback for progress updates */
  onProgress?: (progress: ExportProgress) => void;
}

/**
 * Check if the browser supports WebCodecs API
 */
export function supportsWebCodecs(): boolean {
  return typeof window !== 'undefined' && 'VideoEncoder' in window;
}

/**
 * Check if the browser supports MediaRecorder API
 */
export function supportsMediaRecorder(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window;
}

/**
 * Frame capture interface
 */
export interface FrameCapture {
  /** Capture a frame from the canvas */
  captureFrame: () => ImageData;
  /** Get canvas dimensions */
  getDimensions: () => { width: number; height: number };
}

/**
 * Create a frame capture from an SVG element
 */
export async function createSVGFrameCapture(
  svgElement: SVGSVGElement,
  width: number = DEFAULT_PIXEL_WIDTH,
  height: number = DEFAULT_PIXEL_HEIGHT
): Promise<FrameCapture> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  return {
    captureFrame: () => {
      // Serialize SVG to string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Create image from SVG
      const img = new Image();
      img.src = url;

      // Draw to canvas (synchronously if image is cached)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);

      return ctx.getImageData(0, 0, width, height);
    },
    getDimensions: () => ({ width, height }),
  };
}

/**
 * Create a frame capture from an SVG element (async version)
 */
export async function captureSVGFrame(
  svgElement: SVGSVGElement,
  width: number = DEFAULT_PIXEL_WIDTH,
  height: number = DEFAULT_PIXEL_HEIGHT
): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(ctx.getImageData(0, 0, width, height));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    img.src = url;
  });
}

/**
 * VideoExporter class using MediaRecorder API
 * This is the more widely supported approach
 */
export class VideoExporter {
  private config: Required<VideoExporterOptions>;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stream: MediaStream | null = null;
  private isRecording = false;
  private startTime = 0;

  constructor(options: VideoExporterOptions = {}) {
    this.config = {
      format: options.format ?? 'webm',
      codec: options.codec ?? 'vp9',
      quality: options.quality ?? 0.95,
      frameRate: options.frameRate ?? DEFAULT_FRAME_RATE,
      width: options.width ?? DEFAULT_PIXEL_WIDTH,
      height: options.height ?? DEFAULT_PIXEL_HEIGHT,
      transparent: options.transparent ?? false,
      onProgress: options.onProgress ?? (() => {}),
    };
  }

  /**
   * Initialize the exporter
   */
  async initialize(): Promise<void> {
    if (!supportsMediaRecorder()) {
      throw new Error('MediaRecorder API is not supported in this browser');
    }

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    this.ctx = this.canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create MediaStream from canvas
    this.stream = this.canvas.captureStream(this.config.frameRate);

    // Determine codec
    const mimeType = this.getMimeType();

    if (!MediaRecorder.isTypeSupported(mimeType)) {
      throw new Error(`MIME type ${mimeType} is not supported`);
    }

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      videoBitsPerSecond: this.config.quality * 10000000, // Scale quality to bitrate
    });

    this.recordedChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
  }

  private getMimeType(): string {
    const { format, codec } = this.config;

    if (format === 'webm') {
      if (codec === 'vp9') return 'video/webm;codecs=vp9';
      if (codec === 'vp8') return 'video/webm;codecs=vp8';
      return 'video/webm';
    }

    if (format === 'mp4') {
      if (codec === 'h264') return 'video/mp4;codecs=avc1.42E01E';
      return 'video/mp4';
    }

    return 'video/webm';
  }

  /**
   * Start recording
   */
  start(): void {
    if (!this.mediaRecorder) {
      throw new Error('Exporter not initialized. Call initialize() first.');
    }

    this.isRecording = true;
    this.startTime = performance.now();
    this.mediaRecorder.start();
  }

  /**
   * Add a frame to the recording
   */
  async addFrame(imageData: ImageData): Promise<void> {
    if (!this.ctx || !this.isRecording) {
      return;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Add a frame from an SVG element
   */
  async addFrameFromSVG(svgElement: SVGSVGElement): Promise<void> {
    if (!this.ctx || !this.isRecording) {
      return;
    }

    return new Promise((resolve, reject) => {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        if (this.ctx) {
          this.ctx.fillStyle = '#000000';
          this.ctx.fillRect(0, 0, this.config.width, this.config.height);
          this.ctx.drawImage(img, 0, 0, this.config.width, this.config.height);
        }
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };
      img.src = url;
    });
  }

  /**
   * Stop recording and return the video
   */
  async stop(): Promise<ExportResult> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve({ success: false, error: 'Exporter not initialized' });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const duration = performance.now() - this.startTime;
        const blob = new Blob(this.recordedChunks, { type: this.getMimeType() });
        const url = URL.createObjectURL(blob);

        this.isRecording = false;

        this.config.onProgress({
          currentFrame: 0,
          totalFrames: 0,
          percent: 100,
          stage: 'complete',
          message: 'Export complete',
        });

        resolve({
          success: true,
          blob,
          url,
          duration,
          fileSize: blob.size,
        });
      };

      this.config.onProgress({
        currentFrame: 0,
        totalFrames: 0,
        percent: 99,
        stage: 'finalizing',
        message: 'Finalizing video...',
      });

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel recording
   */
  cancel(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    this.cleanup();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.recordedChunks = [];
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.mediaRecorder = null;
  }
}

/**
 * Export a scene to video
 * This is a high-level function that handles the entire export process
 */
export async function exportToVideo(
  svgElement: SVGSVGElement,
  duration: number,
  onTick: (time: number) => void,
  options: VideoExporterOptions = {}
): Promise<ExportResult> {
  const exporter = new VideoExporter(options);

  try {
    await exporter.initialize();

    const frameRate = options.frameRate ?? DEFAULT_FRAME_RATE;
    const totalFrames = Math.ceil(duration * frameRate);
    const frameDuration = 1000 / frameRate;

    exporter.start();

    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / frameRate;

      // Update scene state
      onTick(time);

      // Small delay to allow React to re-render
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // Capture frame
      await exporter.addFrameFromSVG(svgElement);

      // Report progress
      options.onProgress?.({
        currentFrame: frame + 1,
        totalFrames,
        percent: Math.round(((frame + 1) / totalFrames) * 100),
        stage: 'capturing',
        message: `Capturing frame ${frame + 1} of ${totalFrames}`,
      });
    }

    const result = await exporter.stop();
    exporter.cleanup();

    return result;
  } catch (error) {
    exporter.cancel();
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export PNG sequence
 */
export async function exportToPNGSequence(
  svgElement: SVGSVGElement,
  duration: number,
  onTick: (time: number) => void,
  options: {
    frameRate?: number;
    width?: number;
    height?: number;
    onProgress?: (progress: ExportProgress) => void;
  } = {}
): Promise<Blob[]> {
  const frameRate = options.frameRate ?? DEFAULT_FRAME_RATE;
  const width = options.width ?? DEFAULT_PIXEL_WIDTH;
  const height = options.height ?? DEFAULT_PIXEL_HEIGHT;
  const totalFrames = Math.ceil(duration * frameRate);

  const frames: Blob[] = [];

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / frameRate;

    onTick(time);

    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Capture frame
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) {
            frames.push(blob);
          }
          resolve();
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };
      img.src = url;
    });

    options.onProgress?.({
      currentFrame: frame + 1,
      totalFrames,
      percent: Math.round(((frame + 1) / totalFrames) * 100),
      stage: 'capturing',
      message: `Capturing frame ${frame + 1} of ${totalFrames}`,
    });
  }

  options.onProgress?.({
    currentFrame: totalFrames,
    totalFrames,
    percent: 100,
    stage: 'complete',
    message: 'Export complete',
  });

  return frames;
}

/**
 * Export a single frame as PNG
 */
export async function exportToPNG(
  svgElement: SVGSVGElement,
  options: {
    width?: number;
    height?: number;
  } = {}
): Promise<Blob> {
  const width = options.width ?? DEFAULT_PIXEL_WIDTH;
  const height = options.height ?? DEFAULT_PIXEL_HEIGHT;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  return new Promise((resolve, reject) => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };
    img.src = url;
  });
}

export default VideoExporter;
