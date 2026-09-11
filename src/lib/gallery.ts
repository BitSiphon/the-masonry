export interface Photo {
    id: string;
    key: string;
    format: string;
    size: number;
    uploaded: string | null;
}

interface R2Object {
    key: string;
    size: number;
    uploaded?: Date | string;
}

interface R2ListResult {
    objects: R2Object[];
    truncated?: boolean;
    cursor?: string;
}

export interface GalleryBucket {
    list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<R2ListResult>;
}

interface EdgeCache {
    match(request: Request): Promise<Response | undefined>;
    put(request: Request, response: Response): Promise<void>;
}

const PREFIX = "gallery/";
export const GALLERY_CACHE_KEY = "https://the-masonry.internal/gallery-photos";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const cache = (globalThis as { caches?: { default?: EdgeCache } }).caches?.default;

async function listPhotos(bucket: GalleryBucket): Promise<Photo[]> {
    const photos: Photo[] = [];
    let cursor: string | undefined;

    do {
        const result = await bucket.list({ prefix: PREFIX, cursor });
        for (const object of result.objects) {
            if (object.key.endsWith("/")) continue;
            photos.push({
                key: object.key,
                id: object.key.slice(PREFIX.length).replace(/\.[^.]+$/, ""),
                format: object.key.split(".").pop() ?? "",
                size: object.size,
                uploaded: object.uploaded ? new Date(object.uploaded).toISOString() : null,
            });
        }
        cursor = result.truncated ? result.cursor : undefined;
    } while (cursor);

    return photos.sort((a, b) => a.key.localeCompare(b.key));
}

export interface GetPhotosOptions {
    /** Skip the cache read and list the bucket fresh. Used for local development. */
    fresh?: boolean;
}

export async function getPhotos(
    bucket: GalleryBucket,
    options: GetPhotosOptions = {},
): Promise<Photo[]> {
    const request = new Request(GALLERY_CACHE_KEY);

    if (cache && !options.fresh) {
        const hit = await cache.match(request);
        if (hit) {
            try {
                const { photos, cachedAt } = (await hit.json()) as {
                    photos: Photo[];
                    cachedAt: number;
                };
                if (Array.isArray(photos) && Date.now() - cachedAt < TTL_MS) {
                    return photos;
                }
            } catch {
                // fall through to a fresh listing
            }
        }
    }

    const photos = await listPhotos(bucket);

    if (cache) {
        const response = new Response(JSON.stringify({ photos, cachedAt: Date.now() }), {
            headers: {
                "content-type": "application/json",
                "cache-control": `public, max-age=${TTL_MS / 1000}`,
            },
        });
        await cache.put(request, response);
    }

    return photos;
}

export function isLocalHost(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1";
}
