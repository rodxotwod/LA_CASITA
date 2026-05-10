import { X } from 'lucide-react';
import type { ExperienceObject } from '../data/experience';

type MediaOverlayProps = {
  object: ExperienceObject;
  onClose: () => void;
};

export function MediaOverlay({ object, onClose }: MediaOverlayProps) {
  return (
    <div className="media-overlay" role="dialog" aria-modal="true" aria-label={`${object.songTitle} clip`}>
      <div className="clip-orbit clip-orbit-one" />
      <div className="clip-orbit clip-orbit-two" />
      <div className="clip-photo-stack" aria-hidden="true">
        <div />
        <div />
        <div />
      </div>
      <div className="clip-content">
        <p>{object.label}</p>
        <h1>{object.songTitle}</h1>
        <span>{object.body}</span>
      </div>
      <button className="icon-button overlay-close" type="button" onClick={onClose} aria-label="Close clip">
        <X size={22} />
      </button>
    </div>
  );
}
