export const IMAGE_BASE = "https://images.brockshaffer.dev";

export interface ImageOptions {
    width?: number;
    height?: number;
    fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
    gravity?: "auto" | "face" | "left" | "right" | "top" | "bottom";
    format?: "auto" | "avif" | "webp" | "jpeg" | "png";
    quality?: number | string;
    sharpen?: number;
}

export function imageUrl(key: string, opts: ImageOptions = {}): string {
    const parts: string[] = [];
    if (opts.width) parts.push(`width=${opts.width}`);
    if (opts.height) parts.push(`height=${opts.height}`);
    if (opts.fit) parts.push(`fit=${opts.fit}`);
    if (opts.gravity) parts.push(`gravity=${opts.gravity}`);
    if (opts.format) parts.push(`format=${opts.format}`);
    if (opts.quality !== undefined) parts.push(`quality=${opts.quality}`);
    if (opts.sharpen) parts.push(`sharpen=${opts.sharpen}`);

    const options = parts.join(",");
    if (!options) return `${IMAGE_BASE}/${key}`;
    return `${IMAGE_BASE}/cdn-cgi/image/${options}/${key}`;
}

export function originalUrl(key: string): string {
    return `${IMAGE_BASE}/${key}`;
}

export function srcset(key: string, widths: number[], opts: ImageOptions = {}): string {
    return widths.map((w) => `${imageUrl(key, { ...opts, width: w })} ${w}w`).join(", ");
}
