import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SRT2Prompt",
    short_name: "SRT2Prompt",
    description: "Turn SRT files and scripts into scene prompts, thumbnail prompts, titles, descriptions, hashtags, and keywords.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#08111f",
    theme_color: "#0ea5e9",
    icons: [
      {
        src: "/icon.ico",
        sizes: "any",
        type: "image/x-icon"
      }
    ]
  };
}
