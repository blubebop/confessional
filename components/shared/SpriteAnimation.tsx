"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";

interface SpriteAnimationProps {
  alt: string;
  frames: readonly string[];
  className?: string;
  fps?: number;
  loop?: boolean;
  play?: boolean;
  restartKey?: string | number | bigint;
  preload?: boolean;
  holdWhileLoading?: boolean;
}

const decodedFrames = new Set<string>();
const pendingFrameLoads = new Map<string, Promise<void>>();

const preloadFrame = (frame: string): Promise<void> => {
  if (decodedFrames.has(frame)) {
    return Promise.resolve();
  }

  const existingLoad = pendingFrameLoads.get(frame);
  if (existingLoad != null) {
    return existingLoad;
  }

  const loadPromise = new Promise<void>((resolve) => {
    const image = new window.Image();
    let finished = false;

    const finalize = (): void => {
      if (finished) {
        return;
      }

      finished = true;
      decodedFrames.add(frame);
      pendingFrameLoads.delete(frame);
      resolve();
    };

    const decodeImage = (): void => {
      if (typeof image.decode === "function") {
        image.decode().catch(() => undefined).finally(finalize);
        return;
      }

      finalize();
    };

    image.decoding = "async";
    image.loading = "eager";
    image.onload = decodeImage;
    image.onerror = finalize;
    image.src = frame;

    if (image.complete) {
      decodeImage();
    }
  });

  pendingFrameLoads.set(frame, loadPromise);
  return loadPromise;
};

export const preloadSpriteFrames = async (
  frames: readonly string[]
): Promise<void> => {
  await Promise.all(frames.map((frame) => preloadFrame(frame)));
};

const SpriteAnimation: React.FC<SpriteAnimationProps> = ({
  alt,
  frames,
  className,
  fps = 12,
  loop = true,
  play = true,
  restartKey,
  preload = false,
  holdWhileLoading = false,
}) => {
  const [displayFrames, setDisplayFrames] = useState<readonly string[]>(frames);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const applyFrames = (): void => {
      if (cancelled) {
        return;
      }

      setDisplayFrames(frames);
      setFrameIndex(0);
      setIsReady(true);
    };

    if (!preload) {
      applyFrames();
      return () => {
        cancelled = true;
      };
    }

    if (!holdWhileLoading) {
      applyFrames();
    } else {
      setIsReady(false);
    }

    void preloadSpriteFrames(frames).then(() => {
      applyFrames();
    });

    return () => {
      cancelled = true;
    };
  }, [frames, holdWhileLoading, preload, restartKey]);

  useEffect(() => {
    if (!isReady || !play || displayFrames.length <= 1) {
      return undefined;
    }

    const intervalMs = Math.max(16, Math.floor(1000 / Math.max(1, fps)));
    const intervalId = window.setInterval(() => {
      setFrameIndex((previous) => {
        if (loop) {
          return (previous + 1) % displayFrames.length;
        }

        return previous >= displayFrames.length - 1 ? previous : previous + 1;
      });
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [displayFrames.length, fps, isReady, loop, play]);

  const resolvedFrames = displayFrames.length > 0 ? displayFrames : frames;
  const currentFrame =
    resolvedFrames[Math.min(frameIndex, resolvedFrames.length - 1)];

  return (
    <img
      src={currentFrame}
      alt={alt}
      className={className}
      draggable={false}
      loading="eager"
    />
  );
};

export default SpriteAnimation;
