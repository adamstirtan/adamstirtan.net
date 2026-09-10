type PhotoMetadata = {
  title: string;
  year: number;
};

const photoMetadata: Record<string, PhotoMetadata> = {};

const imageModules = import.meta.glob(
  "./photos/*.{avif,gif,jpeg,jpg,png,webp}",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
) as Record<string, string>;

export const photos = Object.entries(photoMetadata)
  .map(([filename, metadata]) => {
    const src = imageModules[`./photos/${filename}`];

    if (!src) {
      throw new Error(`Missing photo file: ${filename}`);
    }

    return { ...metadata, filename, src };
  })
  .sort((first, second) => second.year - first.year);
