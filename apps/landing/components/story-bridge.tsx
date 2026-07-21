'use client';

interface StoryBridgeProps {
  label: string;
}

export function StoryBridge({ label }: StoryBridgeProps) {
  return (
    <div className="story-bridge" data-story-bridge aria-hidden>
      <span className="story-bridge-line" />
      <span className="story-bridge-label">{label}</span>
      <span className="story-bridge-line" />
    </div>
  );
}
