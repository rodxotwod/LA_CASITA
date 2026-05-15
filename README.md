# La Casita DTMF

A focused React and Three.js prototype that renders a full-screen 3D version of La Casita.

The app is intentionally trimmed down for now: there are no navigation buttons, secondary screens, media overlays, porch interactions, or memory-card flow. The current build is just the 3D house scene with orbit controls so the model can be inspected cleanly.

## Current Experience

- Full-screen Three.js canvas.
- Procedural La Casita model.
- Purple studio-style background.
- Pink house body.
- Flat yellow gabled roof.
- Louvered windows, brown door, porch lamp, plants, shrubs, and rocking chair.
- Orbit controls with constrained camera framing.

## Tech Stack

- React 19
- Vite
- TypeScript
- Three.js
- React Three Fiber
- Drei
- Plain CSS

## Project Structure

```text
src/
  App.tsx
  main.tsx
  styles.css
  components/
    CasitaModel.tsx
    FacadeScene.tsx
```

Important files:

- `src/App.tsx`: Renders the single 3D facade scene.
- `src/components/FacadeScene.tsx`: Three.js canvas, camera, lighting, shadows, and orbit controls.
- `src/components/CasitaModel.tsx`: Procedural 3D La Casita model.
- `src/styles.css`: Full-screen canvas shell.

## Running Locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
