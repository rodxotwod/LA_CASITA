import { ArrowLeft, Camera, Music2 } from 'lucide-react';
import type { ExperienceObject } from '../data/experience';

type MemoryRevealProps = {
  objects: ExperienceObject[];
  onBack: () => void;
};

export function MemoryReveal({ objects, onBack }: MemoryRevealProps) {
  return (
    <section className="memory-screen" aria-label="La Casita memory card">
      <div className="memory-card">
        <div className="memory-photo">
          <div className="mini-house">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="memory-copy">
          <p>La Casita</p>
          <h1>Debi tirar mas fotos en La Casita.</h1>
          <div className="memory-song">
            <Music2 size={18} />
            <span>DtMF</span>
          </div>
          <div className="memory-list">
            {objects.map((object) => (
              <span key={object.id}>{object.memoryTitle}</span>
            ))}
          </div>
        </div>
        <button className="memory-back" type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          <span>Volver al porch</span>
        </button>
      </div>
      <div className="memory-footer">
        <Camera size={18} />
        <span>Proxima habitacion</span>
      </div>
    </section>
  );
}
