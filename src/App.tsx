import { useMemo, useState } from 'react';
import { FacadeScene } from './components/FacadeScene';
import { MediaOverlay } from './components/MediaOverlay';
import { MemoryReveal } from './components/MemoryReveal';
import { PorchRoom } from './components/PorchRoom';
import { allPorchObjectIds, porchObjects, type ExperienceObject } from './data/experience';

type View = 'facade' | 'porch' | 'memory';

function App() {
  const [view, setView] = useState<View>('facade');
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [overlayObject, setOverlayObject] = useState<ExperienceObject | null>(null);
  const [facadeNotice, setFacadeNotice] = useState<string | null>(null);

  const activeObjects = useMemo(
    () => porchObjects.filter((object) => activeIds.has(object.id)),
    [activeIds],
  );

  const activate = (object: ExperienceObject) => {
    const next = new Set(activeIds);
    next.add(object.id);
    setActiveIds(next);

    if (object.kind === 'hero') {
      setOverlayObject(object);
      return;
    }

    if (next.size === allPorchObjectIds.length) {
      window.setTimeout(() => setView('memory'), 520);
    }
  };

  const closeOverlay = () => {
    setOverlayObject(null);
    if (activeIds.size === allPorchObjectIds.length) {
      window.setTimeout(() => setView('memory'), 240);
    }
  };

  const handleFacadeHotspot = (id: string) => {
    const message = id === 'chair'
      ? 'La silla espera adentro.'
      : 'Una luz se mueve detras de las ventanas.';
    setFacadeNotice(message);
    window.setTimeout(() => setFacadeNotice(null), 1800);
  };

  return (
    <main className="app-shell">
      {view === 'facade' ? (
        <FacadeScene onEnter={() => setView('porch')} onHotspot={handleFacadeHotspot} notice={facadeNotice} />
      ) : null}
      {view === 'porch' ? (
        <PorchRoom objects={porchObjects} activeIds={activeIds} onActivate={activate} />
      ) : null}
      {view === 'memory' ? (
        <MemoryReveal objects={activeObjects} onBack={() => setView('porch')} />
      ) : null}
      {overlayObject ? <MediaOverlay object={overlayObject} onClose={closeOverlay} /> : null}
    </main>
  );
}

export default App;
