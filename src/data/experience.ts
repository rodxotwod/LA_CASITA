export type InteractionKind = 'hero' | 'memory' | 'playful';

export type ExperienceObject = {
  id: string;
  label: string;
  kind: InteractionKind;
  songTitle: string;
  memoryTitle: string;
  body: string;
};

export const porchObjects: ExperienceObject[] = [
  {
    id: 'chair',
    label: 'Plastic chair',
    kind: 'hero',
    songTitle: 'DtMF',
    memoryTitle: 'La silla de la foto',
    body: 'The porch folds into a warm photo-memory clip. This slot is ready for the official song video later.',
  },
  {
    id: 'camera',
    label: 'Camera',
    kind: 'memory',
    songTitle: 'DtMF',
    memoryTitle: 'La primera foto',
    body: 'A flash catches the facade, the chair, and the porch light before the moment disappears.',
  },
  {
    id: 'radio',
    label: 'Radio',
    kind: 'playful',
    songTitle: 'DtMF',
    memoryTitle: 'La estacion de la casa',
    body: 'The radio scans through fragments of the house, teasing the rooms that will open next.',
  },
];

export const allPorchObjectIds = porchObjects.map((object) => object.id);
