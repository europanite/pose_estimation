import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import type { PosePoint, PoseResponse } from './types';

type OverlayLayout = {
  width: number;
  height: number;
};

function getImageDrawRect(pose: PoseResponse, layout: OverlayLayout) {
  const imageAspect = pose.width / pose.height;
  const containerAspect = layout.width / layout.height;

  if (containerAspect > imageAspect) {
    const drawHeight = layout.height;
    const drawWidth = drawHeight * imageAspect;
    return {
      width: drawWidth,
      height: drawHeight,
      offsetX: (layout.width - drawWidth) / 2,
      offsetY: 0,
    };
  }

  const drawWidth = layout.width;
  const drawHeight = drawWidth / imageAspect;
  return {
    width: drawWidth,
    height: drawHeight,
    offsetX: 0,
    offsetY: (layout.height - drawHeight) / 2,
  };
}

export default function PoseOverlay({
  pose,
  layout,
}: {
  pose: PoseResponse;
  layout: OverlayLayout | null;
}) {
  const person = pose.people[0];
  if (!person || !layout || layout.width <= 0 || layout.height <= 0) return null;

  const rect = getImageDrawRect(pose, layout);
  const minScore = 0.05;

  const x = (p: PosePoint) => rect.offsetX + p.x * rect.width;
  const y = (p: PosePoint) => rect.offsetY + p.y * rect.height;

  const strokeWidth = Math.max(3, Math.min(layout.width, layout.height) * 0.006);
  const pointRadius = Math.max(4, Math.min(layout.width, layout.height) * 0.01);

  return (
    <Svg
      pointerEvents="none"
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      style={styles.overlay}
    >
      {pose.bones.map(([a, b]) => {
        const pa = person.keypoints[a];
        const pb = person.keypoints[b];
        if (!pa || !pb || pa.score < minScore || pb.score < minScore) return null;

        return (
          <Line
            key={`${a}-${b}`}
            x1={x(pa)}
            y1={y(pa)}
            x2={x(pb)}
            y2={y(pb)}
            stroke="lime"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      })}

      {Object.entries(person.keypoints).map(([name, p]) => {
        if (!p || p.score < minScore) return null;

        return (
          <Circle
            key={name}
            cx={x(p)}
            cy={y(p)}
            r={pointRadius}
            fill="yellow"
            stroke="black"
            strokeWidth={1}
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});