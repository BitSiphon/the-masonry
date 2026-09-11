import { cf, finalize } from "@astrojs/cloudflare/fetch";
import { astro, FetchState } from "astro/fetch";
import { GALLERY_CACHE_KEY } from "./lib/gallery";

interface Env {
    GALLERY: R2Bucket;
}

interface QueueMessage {
    ack(): void;
}

interface QueueBatch {
    messages: QueueMessage[];
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const state = new FetchState(request);
        const asset = await cf(state, env, ctx);
        if (asset) return asset;
        return finalize(state, await astro(state));
    },

    async queue(batch: QueueBatch) {
        const request = new Request(GALLERY_CACHE_KEY);
        for (const message of batch.messages) {
            await caches.default.delete(request);
            message.ack();
        }
    },
};
