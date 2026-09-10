# adamstirtan.net

Personal homepage built with Vue, TypeScript, and Vite.

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## Photography

Add each image to `src/content/photos/`, then add its filename, title, and year
to `src/content/photos.ts`:

```ts
const photoMetadata = {
  "quiet-water.jpg": { title: "Quiet water", year: 2026 },
};
```

The photography page discovers the local image automatically. The build fails
when a manifest entry does not have a matching image file.

The Azure Static Web Apps workflow builds the app and deploys the `dist` directory on pushes to `master`.
