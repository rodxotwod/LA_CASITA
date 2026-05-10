# La Casita DTMF

An interactive web prototype for a fan experience inspired by Bad Bunny's `DeBÍ TiRAR MáS FOToS` tour world. The experience turns La Casita into a digital, explorable memory house: fans start at a full-screen 3D facade, enter the porch, activate objects tied to a song, and unlock a final memory card.

## Experience Concept

The emotional promise is simple: fans should feel like they are entering a Puerto Rican house where objects wake up music and memories. The prototype is built as a vertical slice rather than a full tour, so it focuses on proving the core experience loop:

1. See La Casita as the recognizable first-screen hook.
2. Click the facade to enter.
3. Explore one room: the porch.
4. Activate three objects connected to `DtMF`.
5. Unlock a memory-card ending after all objects are found.

The current direction is intentionally fan-facing and experiential, not political or museum-like. It prioritizes emotion, recognition, music, nostalgia, and a clear path for replacing placeholder media with official tour assets later.

## Current Vertical Slice

### 1. Front-Facing 3D Facade

The opening screen is a full-page Three.js model of La Casita in a toy-like 3D style:

- Purple studio-style background.
- Front-facing full-casita composition.
- Pink house body.
- Chunky yellow roof.
- Porch arches.
- Louvered windows.
- Brown front door.
- Warm porch lamp.
- Green base, steps, plants, and orange rocking chair.

The facade has invisible interactive regions over the door, chair, and window. They preserve a clean model view while still letting fans interact with the house.

### 2. Porch Room

Clicking the door enters the porch scene. This is the first complete room and the model for future rooms.

The porch has three clickable objects:

- Plastic chair: hero object tied to `DtMF`; opens the fullscreen placeholder clip.
- Camera: memory object; collects the first photo memory.
- Radio: playful object; teases the future music-discovery mechanic.

### 3. Fullscreen Clip Moment

The plastic chair opens a polished fullscreen `DtMF` placeholder clip. It is not an official video asset. It exists to prove the interaction and media overlay behavior.

The app is structured so this placeholder can later be replaced with official video or audio clips without rebuilding the experience.

### 4. Memory Card Ending

After all three porch objects are activated, the prototype reveals a memory card:

- La Casita thumbnail.
- Collected song: `DtMF`.
- Activated object memories.
- A final line: `Debi tirar mas fotos en La Casita.`

This proves the souvenir mechanic for a future digital postcard, photo strip, or shareable fan memory.

## Tech Stack

- React 19
- Vite
- TypeScript
- Three.js
- Lucide React icons
- Plain CSS

## Project Structure

```text
src/
  App.tsx
  main.tsx
  styles.css
  data/
    experience.ts
  components/
    FacadeScene.tsx
    PorchRoom.tsx
    MediaOverlay.tsx
    MemoryReveal.tsx
```

Important files:

- `src/components/FacadeScene.tsx`: Three.js model for the opening La Casita facade.
- `src/components/PorchRoom.tsx`: Interactive porch scene with three clickable objects.
- `src/components/MediaOverlay.tsx`: Fullscreen placeholder clip experience.
- `src/components/MemoryReveal.tsx`: End-state memory card.
- `src/data/experience.ts`: Data model for songs, objects, memory titles, and future media replacement.
- `src/styles.css`: Layout, responsive framing, porch illustration, overlay, memory card, and hotspot styling.

## Replacing Placeholder Media

The current `DtMF` clip is a generated in-app visual, not a video file. To replace it with official media later, extend the object data in `src/data/experience.ts` with fields such as:

```ts
videoSrc: '/media/dtmf-chair.mp4',
poster: '/media/dtmf-chair-poster.jpg',
duration: 30,
```

Then update `MediaOverlay.tsx` to render a `<video>` element when `videoSrc` is present, falling back to the current animated placeholder when it is not.

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

## Design Notes

- The first screen should remain the hook: no landing page, no long intro copy.
- The facade should stay clean and recognizable, so hotspots are invisible until hover or keyboard focus.
- Future rooms should follow the same object pattern: one hero object, one memory object, one playful object.
- Each room should have one hero song, with secondary references kept as small discoveries.
- The experience should work in 5-10 minutes while allowing fans to linger.

## Next Build Steps

Suggested next rooms:

- Living room: music history, records, TV, and salsa/diaspora mood.
- Kitchen: family table, pitorro/coconut references, warm celebration.
- Bedroom: private nightlife memory and `EL CLuB` style overlay.
- Patio finale: dance, lights, and collective release moment.

Suggested technical next steps:

- Add real media support to `MediaOverlay`.
- Add route or state structure for multiple rooms.
- Add a downloadable/shareable memory card.
- Add mobile-specific object placement tuning.
- Add accessibility polish for object descriptions and keyboard navigation.
