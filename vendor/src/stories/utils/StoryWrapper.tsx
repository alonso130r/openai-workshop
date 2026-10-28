/**
 * StoryWrapper - Consistent scene wrapper for all stories
 * Provides standard ManimScene configuration
 */

import React from 'react';
import { ManimScene } from '../../components/Scene/ManimScene';
import type { StoryWrapperProps } from './types';

export const StoryWrapper: React.FC<StoryWrapperProps> = ({
  children,
  width = 800,
  height = 450,
  showControls = true,
  backgroundColor,
  autoPlay = false,
  loop = false,
}) => {
  return (
    <ManimScene
      width={width}
      height={height}
      showControls={showControls}
      backgroundColor={backgroundColor}
      autoPlay={autoPlay}
      loop={loop}
    >
      {children}
    </ManimScene>
  );
};
