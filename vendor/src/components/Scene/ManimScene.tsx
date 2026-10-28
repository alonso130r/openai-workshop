/**
 * ManimReact - ManimScene Component
 * Main scene container for rendering animations
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import { v4 as uuid } from 'uuid';
import { SceneProvider } from './SceneContext';
import { useSceneStore } from '../../core/store';
import { useScopedAnimationEngine } from '../../animations/hooks';
import type { SceneHandle, ExportConfig, ExportProgressCallback } from '../../core/types';
import {
  DEFAULT_PIXEL_WIDTH,
  DEFAULT_PIXEL_HEIGHT,
  DEFAULT_FPS,
  DEFAULT_FRAME_WIDTH,
  DEFAULT_FRAME_HEIGHT,
  COLORS,
} from '../../core/constants';

export interface ManimSceneProps {
  /** Unique scene ID (auto-generated if not provided) */
  sceneId?: string;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Frames per second */
  fps?: number;
  /** Background color */
  backgroundColor?: string;
  /** Frame width in math units */
  frameWidth?: number;
  /** Frame height in math units */
  frameHeight?: number;
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Loop animation */
  loop?: boolean;
  /** Show controls */
  showControls?: boolean;
  /** CSS class name */
  className?: string;
  /** CSS styles */
  style?: React.CSSProperties;
  /** Children (mobjects and animations) */
  children?: React.ReactNode;
  /** Called when scene starts playing */
  onPlay?: () => void;
  /** Called when scene pauses */
  onPause?: () => void;
  /** Called when scene ends */
  onEnd?: () => void;
  /** Called on time update */
  onTimeUpdate?: (time: number) => void;
}

/**
 * Inner Scene Component (with access to context)
 */
const SceneInner = forwardRef<SceneHandle, ManimSceneProps & { sceneId: string }>((props, ref) => {
  const {
    sceneId,
    width = DEFAULT_PIXEL_WIDTH,
    height = DEFAULT_PIXEL_HEIGHT,
    backgroundColor = COLORS.BACKGROUND,
    autoPlay = false,
    loop = false,
    showControls = true,
    className,
    style,
    children,
    onPlay,
    onPause,
    onEnd,
    onTimeUpdate,
  } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const loopRef = useRef(loop);
  
  // Track timeline time for display
  const [displayTime, setDisplayTime] = useState(0);
  const [displayDuration, setDisplayDuration] = useState(0);

  // Get scoped animation engine
  const engine = useScopedAnimationEngine(sceneId);

  // Store methods
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const storePlay = useSceneStore((s) => s.play);
  const storePause = useSceneStore((s) => s.pause);
  const storeStop = useSceneStore((s) => s.stop);
  const addMobject = useSceneStore((s) => s.addMobject);
  const removeMobject = useSceneStore((s) => s.removeMobject);
  const getMobject = useSceneStore((s) => s.getMobject);
  const setTotalDuration = useSceneStore((s) => s.setTotalDuration);

  // Update loop ref
  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  // Set up master timeline callbacks
  useEffect(() => {
    engine.setMasterTimelineCallbacks({
      onStart: () => {
        onPlay?.();
      },
      onUpdate: (_progress, time) => {
        setDisplayTime(time);
        onTimeUpdate?.(time);
      },
      onComplete: () => {
        if (loopRef.current) {
          engine.seekMasterTimeline(0);
          engine.playMasterTimeline();
        } else {
          storePause();
          onEnd?.();
        }
      },
    });

    // Update duration display when master timeline changes
    const updateDuration = () => {
      const duration = engine.getMasterTimelineDuration();
      setDisplayDuration(duration);
      setTotalDuration(duration);
    };

    // Check duration periodically (timeline might not be built immediately)
    const interval = setInterval(updateDuration, 100);
    return () => clearInterval(interval);
  }, [engine, onPlay, onEnd, onTimeUpdate, storePause, setTotalDuration]);

  // Wrapped play function that also plays master timeline
  const play = useCallback(() => {
    storePlay();
    engine.playMasterTimeline();
    onPlay?.();
  }, [storePlay, engine, onPlay]);

  // Wrapped pause function
  const pause = useCallback(() => {
    storePause();
    engine.pauseMasterTimeline();
    onPause?.();
  }, [storePause, engine, onPause]);

  // Wrapped stop function
  const stop = useCallback(() => {
    storeStop();
    engine.stopMasterTimeline();
    engine.resetAllToInitialState();
    setDisplayTime(0);
  }, [storeStop, engine]);

  // Wrapped seek function
  const storeSeek = useSceneStore((s) => s.seek);
  const seek = useCallback((time: number) => {
    storeSeek(time);
    engine.seekMasterTimeline(time);
    setDisplayTime(time);
  }, [storeSeek, engine]);

  // Auto-play
  useEffect(() => {
    if (autoPlay) {
      // Small delay to ensure children are mounted
      const timeout = setTimeout(() => {
        play();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [autoPlay, play]);

  // Export function
  const exportVideo = useCallback(
    async (_config: ExportConfig, _onProgress?: ExportProgressCallback): Promise<Blob> => {
      // This will be implemented in the export module
      throw new Error('Export not yet implemented');
    },
    []
  );

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      play,
      pause,
      stop,
      seek,
      getCurrentTime: () => engine.getMasterTimelineTime(),
      getTotalDuration: () => engine.getMasterTimelineDuration(),
      addMobject,
      removeMobject,
      getMobject,
      export: exportVideo,
    }),
    [play, pause, stop, seek, addMobject, removeMobject, getMobject, exportVideo, engine]
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        ...style,
      }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          backgroundColor,
          display: 'block',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* The host bundles KaTeX styles locally. */}

        {/* Scene content */}
        <g id="scene-content">{children}</g>
      </svg>

      {/* Controls overlay */}
      {showControls && (
        <SceneControls
          isPlaying={isPlaying}
          currentTime={displayTime}
          totalDuration={displayDuration}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onSeek={seek}
        />
      )}
    </div>
  );
});

SceneInner.displayName = 'SceneInner';

/**
 * Scene Controls Component
 */
interface SceneControlsProps {
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
}

function SceneControls({
  isPlaying,
  currentTime,
  totalDuration,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: SceneControlsProps) {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#fff',
      }}
    >
      {/* Play/Pause button */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '16px',
        }}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Stop/Reset button */}
      <button
        onClick={onStop}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '16px',
        }}
        title="Stop and Reset"
      >
        ⏹
      </button>

      {/* Time display */}
      <span style={{ minWidth: '100px', textAlign: 'center' }}>
        {formatTime(currentTime)} / {formatTime(totalDuration || 0)}
      </span>

      {/* Progress bar */}
      <input
        type="range"
        min={0}
        max={totalDuration || 1}
        step={0.01}
        value={currentTime}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        style={{
          flex: 1,
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

/**
 * ManimScene Component
 * Main entry point for creating Manim-style animations
 */
export const ManimScene = forwardRef<SceneHandle, ManimSceneProps>(
  (props, ref) => {
    const {
      sceneId,
      width = DEFAULT_PIXEL_WIDTH,
      height = DEFAULT_PIXEL_HEIGHT,
      fps = DEFAULT_FPS,
      backgroundColor = COLORS.BACKGROUND,
      frameWidth = DEFAULT_FRAME_WIDTH,
      frameHeight = DEFAULT_FRAME_HEIGHT,
      ...rest
    } = props;

    // Generate a stable scene ID if not provided
    const stableSceneId = useMemo(() => sceneId || `scene-${uuid()}`, [sceneId]);

    return (
      <SceneProvider
        width={width}
        height={height}
        fps={fps}
        backgroundColor={backgroundColor}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
      >
        <SceneInner
          ref={ref}
          sceneId={stableSceneId}
          width={width}
          height={height}
          backgroundColor={backgroundColor}
          {...rest}
        />
      </SceneProvider>
    );
  }
);

ManimScene.displayName = 'ManimScene';

export default ManimScene;
