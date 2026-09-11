// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    site: "https://brockshaffer.dev",
    output: "server",
    session: false,

    adapter: cloudflare({
        imageService: "passthrough",
    }),

    prefetch: {
        prefetchAll: true,
        defaultStrategy: "tap",
    },
});
