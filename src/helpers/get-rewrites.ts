import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import type { Rewrite } from 'next/dist/lib/load-custom-routes';
import type { ManifestRewrites } from '../types';

/** Local rewrite cache to avoid non-required file system operations. */
let rewritesCache: Rewrite[];

/** Object representing a simplified version of the route manifest files. */
export type RoutesManifest = {
  rewrites: Rewrite[];
};

/**
 * Get the Next.js `Rewrite` objects directly from the build manifest.
 *
 * On the client side it's possible to use `getClientBuildManifest` but for server side rendering, this function is required.
 *
 * @returns An array of `Rewrite` objects.
 */
export function getRewrites(): Rewrite[] {
  if (rewritesCache) return rewritesCache;

  // Try to get the content of the routes-manifest (.next/routes-manifest.json) first - this is only available on builds.
  const routesManifestPath = resolve('.next', 'routes-manifest.json');

  if (existsSync(routesManifestPath)) {
    const routesManifest = JSON.parse(readFileSync(routesManifestPath, 'utf8')) as RoutesManifest;
    const rewrites = routesManifest.rewrites.map((rewrite) => {
      return {
        source: rewrite.source,
        destination: rewrite.destination,
        locale: rewrite.locale,
      };
    });

    // Save to the cache.
    rewritesCache = rewrites;
    return rewritesCache;
  }

  // If the server routes-manifest is not available, then get can get the rewrites from the client build manifest.
  const buildManifestPath = resolve('.next', 'build-manifest.json');
  const buildManifestContent = readFileSync(buildManifestPath, 'utf8');

  // Get the content of the client build-manifest (e.g. .next/static/development/_buildManifest.json).
  const clientBuildManifestPath = (
    JSON.parse(buildManifestContent).lowPriorityFiles as string[]
  ).find((filePaths) => filePaths.includes('_buildManifest.js'));
  const clientBuildManifestContent = readFileSync(
    resolve('.next', clientBuildManifestPath),
    'utf8'
  );

  // Transform the client build-manifest file content back into a usable object.
  const clientBuildManifest = {} as { __BUILD_MANIFEST: { __rewrites: ManifestRewrites } };
  new Function('self', clientBuildManifestContent)(clientBuildManifest);

  // Save to the cache.
  rewritesCache = clientBuildManifest.__BUILD_MANIFEST.__rewrites.afterFiles;
  return rewritesCache;
}
