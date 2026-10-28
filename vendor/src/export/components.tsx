/**
 * ManimReact - Export Components
 * UI components for video export functionality
 */

import React, { useCallback, useRef } from 'react';
import type { ExportProgress, ExportResult, VideoExporterOptions } from './exporter';
import { COLORS } from '../core/constants';

export interface ExportButtonProps {
  /** Text to display on the button */
  children?: React.ReactNode;
  /** Called when export is triggered */
  onExport: () => Promise<ExportResult>;
  /** Called with progress updates */
  onProgress?: (progress: ExportProgress) => void;
  /** Called when export completes */
  onComplete?: (result: ExportResult) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button style */
  style?: React.CSSProperties;
  /** Button class name */
  className?: string;
}

/**
 * ExportButton Component
 * A simple button that triggers video export
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  children = 'Export Video',
  onExport,
  onProgress,
  onComplete,
  disabled = false,
  style,
  className,
}) => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [progress, setProgress] = React.useState<ExportProgress | null>(null);

  const handleClick = useCallback(async () => {
    setIsExporting(true);
    setProgress(null);

    const result = await onExport();

    setIsExporting(false);
    onComplete?.(result);
  }, [onExport, onComplete]);

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    color: 'white',
    backgroundColor: isExporting ? COLORS.GRAY_C : COLORS.BLUE,
    border: 'none',
    borderRadius: '8px',
    cursor: isExporting || disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 0.2s, opacity 0.2s',
    ...style,
  };

  return (
    <button
      onClick={handleClick}
      disabled={isExporting || disabled}
      style={buttonStyle}
      className={className}
    >
      {isExporting ? `Exporting... ${progress?.percent ?? 0}%` : children}
    </button>
  );
};

export interface ExportProgressBarProps {
  /** Current progress */
  progress: ExportProgress | null;
  /** Bar height */
  height?: number;
  /** Show percentage text */
  showPercent?: boolean;
  /** Show stage message */
  showMessage?: boolean;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * ExportProgressBar Component
 * Displays export progress as a progress bar
 */
export const ExportProgressBar: React.FC<ExportProgressBarProps> = ({
  progress,
  height = 8,
  showPercent = true,
  showMessage = true,
  style,
}) => {
  const percent = progress?.percent ?? 0;
  const message = progress?.message ?? '';
  const stage = progress?.stage ?? 'capturing';

  const containerStyle: React.CSSProperties = {
    width: '100%',
    ...style,
  };

  const barContainerStyle: React.CSSProperties = {
    width: '100%',
    height: `${height}px`,
    backgroundColor: '#333',
    borderRadius: `${height / 2}px`,
    overflow: 'hidden',
  };

  const barStyle: React.CSSProperties = {
    width: `${percent}%`,
    height: '100%',
    backgroundColor:
      stage === 'complete'
        ? COLORS.GREEN
        : stage === 'error'
        ? COLORS.RED
        : COLORS.BLUE,
    transition: 'width 0.3s ease-out',
    borderRadius: `${height / 2}px`,
  };

  const textStyle: React.CSSProperties = {
    marginTop: '8px',
    fontSize: '14px',
    color: '#888',
  };

  return (
    <div style={containerStyle}>
      <div style={barContainerStyle}>
        <div style={barStyle} />
      </div>
      {(showPercent || showMessage) && (
        <div style={textStyle}>
          {showPercent && <span>{percent}%</span>}
          {showPercent && showMessage && <span> - </span>}
          {showMessage && <span>{message}</span>}
        </div>
      )}
    </div>
  );
};

export interface ExportPanelProps {
  /** Scene SVG element ref */
  svgRef: React.RefObject<SVGSVGElement>;
  /** Animation duration in seconds */
  duration: number;
  /** Function to update scene time */
  onTick: (time: number) => void;
  /** Export options */
  exportOptions?: VideoExporterOptions;
  /** Called when export completes */
  onExportComplete?: (result: ExportResult) => void;
  /** Panel style */
  style?: React.CSSProperties;
}

/**
 * ExportPanel Component
 * A complete export panel with controls and progress display
 */
export const ExportPanel: React.FC<ExportPanelProps> = ({
  svgRef,
  duration,
  onTick,
  exportOptions,
  onExportComplete,
  style,
}) => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [progress, setProgress] = React.useState<ExportProgress | null>(null);
  const [result, setResult] = React.useState<ExportResult | null>(null);
  const [format, setFormat] = React.useState<'webm' | 'mp4'>('webm');
  const [quality, setQuality] = React.useState(0.95);

  const handleExport = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return;

    setIsExporting(true);
    setProgress(null);
    setResult(null);

    // Dynamic import to avoid loading export code until needed
    const { exportToVideo, downloadBlob } = await import('./exporter');

    const exportResult = await exportToVideo(svg, duration, onTick, {
      ...exportOptions,
      format,
      quality,
      onProgress: setProgress,
    });

    setResult(exportResult);
    setIsExporting(false);

    if (exportResult.success && exportResult.blob) {
      downloadBlob(exportResult.blob, `animation.${format}`);
    }

    onExportComplete?.(exportResult);
  }, [svgRef, duration, onTick, exportOptions, format, quality, onExportComplete]);

  const panelStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    color: 'white',
    fontFamily: 'system-ui, sans-serif',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#888',
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    marginBottom: '16px',
    backgroundColor: '#333',
    border: '1px solid #444',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
  };

  const sliderContainerStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Export Video</h3>

      <label style={labelStyle}>Format</label>
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as 'webm' | 'mp4')}
        style={selectStyle}
        disabled={isExporting}
      >
        <option value="webm">WebM (VP9)</option>
        <option value="mp4">MP4 (H.264)</option>
      </select>

      <div style={sliderContainerStyle}>
        <label style={labelStyle}>Quality: {Math.round(quality * 100)}%</label>
        <input
          type="range"
          min="0.5"
          max="1"
          step="0.05"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          style={sliderStyle}
          disabled={isExporting}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <span style={labelStyle}>Duration: {duration.toFixed(1)}s</span>
      </div>

      {isExporting && <ExportProgressBar progress={progress} />}

      {result && !isExporting && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: result.success ? '#1a3a1a' : '#3a1a1a',
            borderRadius: '6px',
          }}
        >
          {result.success ? (
            <>
              <div style={{ color: COLORS.GREEN }}>✓ Export complete!</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                Size: {((result.fileSize ?? 0) / 1024 / 1024).toFixed(2)} MB
              </div>
            </>
          ) : (
            <div style={{ color: COLORS.RED }}>✗ {result.error}</div>
          )}
        </div>
      )}

      <ExportButton
        onExport={handleExport}
        disabled={isExporting}
        style={{ width: '100%' }}
      >
        {isExporting ? 'Exporting...' : 'Export Video'}
      </ExportButton>
    </div>
  );
};

export default ExportPanel;
