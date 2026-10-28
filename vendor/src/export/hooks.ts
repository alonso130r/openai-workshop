/**
 * ManimReact - React hooks for video export
 */

import { useCallback, useState, useRef } from 'react';
import {
  VideoExporter,
  exportToVideo,
  exportToPNG,
  exportToPNGSequence,
  downloadBlob,
  type ExportProgress,
  type ExportResult,
  type VideoExporterOptions,
} from './exporter';
import { DEFAULT_FRAME_RATE, DEFAULT_PIXEL_WIDTH, DEFAULT_PIXEL_HEIGHT } from '../core/constants';

export interface UseVideoExportOptions extends VideoExporterOptions {
  /** Auto-download after export */
  autoDownload?: boolean;
  /** Default filename (without extension) */
  filename?: string;
}

export interface UseVideoExportReturn {
  /** Export the scene to video */
  exportVideo: (
    svgElement: SVGSVGElement,
    duration: number,
    onTick: (time: number) => void
  ) => Promise<ExportResult>;
  /** Export current frame as PNG */
  exportPNG: (svgElement: SVGSVGElement) => Promise<Blob>;
  /** Export animation as PNG sequence */
  exportPNGSequence: (
    svgElement: SVGSVGElement,
    duration: number,
    onTick: (time: number) => void
  ) => Promise<Blob[]>;
  /** Cancel ongoing export */
  cancelExport: () => void;
  /** Download a blob */
  download: (blob: Blob, filename?: string) => void;
  /** Current export progress */
  progress: ExportProgress | null;
  /** Whether export is in progress */
  isExporting: boolean;
  /** Last export result */
  result: ExportResult | null;
  /** Last error */
  error: string | null;
}

/**
 * Hook for exporting ManimReact scenes to video
 */
export function useVideoExport(options: UseVideoExportOptions = {}): UseVideoExportReturn {
  const {
    autoDownload = false,
    filename = 'manim-animation',
    format = 'webm',
    ...exportOptions
  } = options;

  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exporterRef = useRef<VideoExporter | null>(null);
  const cancelledRef = useRef(false);

  const handleProgress = useCallback((p: ExportProgress) => {
    setProgress(p);
    options.onProgress?.(p);
  }, [options.onProgress]);

  const exportVideo = useCallback(
    async (
      svgElement: SVGSVGElement,
      duration: number,
      onTick: (time: number) => void
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setError(null);
      setResult(null);
      cancelledRef.current = false;

      try {
        const exportResult = await exportToVideo(svgElement, duration, onTick, {
          ...exportOptions,
          format,
          onProgress: handleProgress,
        });

        if (cancelledRef.current) {
          return { success: false, error: 'Export cancelled' };
        }

        setResult(exportResult);

        if (exportResult.success && exportResult.blob && autoDownload) {
          const extension = format === 'mp4' ? 'mp4' : 'webm';
          downloadBlob(exportResult.blob, `${filename}.${extension}`);
        }

        return exportResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsExporting(false);
      }
    },
    [exportOptions, format, handleProgress, autoDownload, filename]
  );

  const exportPNGFn = useCallback(
    async (svgElement: SVGSVGElement): Promise<Blob> => {
      setIsExporting(true);
      setError(null);

      try {
        const blob = await exportToPNG(svgElement, {
          width: exportOptions.width ?? DEFAULT_PIXEL_WIDTH,
          height: exportOptions.height ?? DEFAULT_PIXEL_HEIGHT,
        });

        if (autoDownload) {
          downloadBlob(blob, `${filename}.png`);
        }

        return blob;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    [exportOptions.width, exportOptions.height, autoDownload, filename]
  );

  const exportPNGSequenceFn = useCallback(
    async (
      svgElement: SVGSVGElement,
      duration: number,
      onTick: (time: number) => void
    ): Promise<Blob[]> => {
      setIsExporting(true);
      setError(null);
      cancelledRef.current = false;

      try {
        const frames = await exportToPNGSequence(svgElement, duration, onTick, {
          frameRate: exportOptions.frameRate ?? DEFAULT_FRAME_RATE,
          width: exportOptions.width ?? DEFAULT_PIXEL_WIDTH,
          height: exportOptions.height ?? DEFAULT_PIXEL_HEIGHT,
          onProgress: handleProgress,
        });

        if (autoDownload) {
          // Download as individual files or zip (individual for now)
          frames.forEach((frame, index) => {
            downloadBlob(frame, `${filename}_${String(index).padStart(5, '0')}.png`);
          });
        }

        return frames;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    [exportOptions, handleProgress, autoDownload, filename]
  );

  const cancelExport = useCallback(() => {
    cancelledRef.current = true;
    exporterRef.current?.cancel();
    setIsExporting(false);
  }, []);

  const download = useCallback(
    (blob: Blob, customFilename?: string) => {
      const extension = blob.type.includes('png')
        ? 'png'
        : blob.type.includes('mp4')
        ? 'mp4'
        : 'webm';
      downloadBlob(blob, customFilename ?? `${filename}.${extension}`);
    },
    [filename]
  );

  return {
    exportVideo,
    exportPNG: exportPNGFn,
    exportPNGSequence: exportPNGSequenceFn,
    cancelExport,
    download,
    progress,
    isExporting,
    result,
    error,
  };
}

/**
 * Hook for managing export progress UI
 */
export function useExportProgress(): {
  progress: ExportProgress | null;
  setProgress: (progress: ExportProgress | null) => void;
  isComplete: boolean;
  isError: boolean;
  percentComplete: number;
  message: string;
} {
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  return {
    progress,
    setProgress,
    isComplete: progress?.stage === 'complete',
    isError: progress?.stage === 'error',
    percentComplete: progress?.percent ?? 0,
    message: progress?.message ?? '',
  };
}

export default useVideoExport;
