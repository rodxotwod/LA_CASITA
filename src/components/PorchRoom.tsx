import { Camera, CircleDot, Radio, Sofa } from 'lucide-react';
import type { ExperienceObject } from '../data/experience';

type PorchRoomProps = {
  activeIds: Set<string>;
  onActivate: (object: ExperienceObject) => void;
  objects: ExperienceObject[];
};

function isActive(activeIds: Set<string>, id: string) {
  return activeIds.has(id);
}

export function PorchRoom({ activeIds, onActivate, objects }: PorchRoomProps) {
  const chair = objects.find((object) => object.id === 'chair')!;
  const camera = objects.find((object) => object.id === 'camera')!;
  const radio = objects.find((object) => object.id === 'radio')!;

  return (
    <section className="porch-screen" aria-label="La Casita porch">
      <div className="porch-background">
        <div className="porch-roof" />
        <div className="porch-wall">
          <div className="porch-window porch-window-left">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="porch-door" />
          <div className="porch-window porch-window-right">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="wall-shadow" />
        </div>
        <div className="porch-floor" />
        <div className="porch-plant plant-left" />
        <div className="porch-plant plant-right" />
        <div className="porch-chair-visual" aria-hidden="true">
          <span />
        </div>
        <div className="porch-camera-visual" aria-hidden="true" />
        <div className="porch-radio-visual" aria-hidden="true">
          <span />
        </div>
        <button
          className={`object-button object-chair ${isActive(activeIds, chair.id) ? 'is-active' : ''}`}
          type="button"
          onClick={() => onActivate(chair)}
          aria-label="Play DtMF from the plastic chair"
        >
          <Sofa size={28} />
          <span>{chair.label}</span>
        </button>
        <button
          className={`object-button object-camera ${isActive(activeIds, camera.id) ? 'is-active' : ''}`}
          type="button"
          onClick={() => onActivate(camera)}
          aria-label="Collect the camera memory"
        >
          <Camera size={24} />
          <span>{camera.label}</span>
        </button>
        <button
          className={`object-button object-radio ${isActive(activeIds, radio.id) ? 'is-active' : ''}`}
          type="button"
          onClick={() => onActivate(radio)}
          aria-label="Tune the porch radio"
        >
          <Radio size={24} />
          <span>{radio.label}</span>
        </button>
        <div className="porch-progress" aria-live="polite">
          <CircleDot size={16} />
          <span>
            {activeIds.size}/{objects.length}
          </span>
        </div>
      </div>
    </section>
  );
}
