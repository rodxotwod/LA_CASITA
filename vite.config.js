import react from '@vitejs/plugin-react';
import { cpSync, createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectDir = dirname(fileURLToPath(import.meta.url));
const githubRepoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.GITHUB_ACTIONS && githubRepoName ? `/${githubRepoName}/` : '/';

function staticAssetsPlugin() {
  const assetsDir = resolve(projectDir, 'ASSETS');

  return {
    name: 'static-assets-folder',
    configureServer(server) {
      server.middlewares.use('/ASSETS', (request, response, next) => {
        if (!request.url) {
          next();
          return;
        }

        const fileUrl = new URL(request.url, 'http://localhost');
        const requestedPath = decodeURIComponent(fileUrl.pathname.slice(1));
        const filePath = resolve(assetsDir, requestedPath);

        if (!filePath.startsWith(assetsDir) || !existsSync(filePath) || !statSync(filePath).isFile()) {
          next();
          return;
        }

        const extension = filePath.split('.').at(-1)?.toLowerCase();
        const contentType = extension === 'mp3'
          ? 'audio/mpeg'
          : extension === 'webp'
            ? 'image/webp'
            : extension === 'png'
              ? 'image/png'
              : extension === 'jpg' || extension === 'jpeg'
                ? 'image/jpeg'
                : 'application/octet-stream';

        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('Content-Type', contentType);
        createReadStream(filePath).pipe(response);
      });
    },
    closeBundle() {
      if (!existsSync(assetsDir)) return;
      cpSync(assetsDir, resolve(projectDir, 'dist/ASSETS'), { recursive: true });
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), staticAssetsPlugin()],
});
