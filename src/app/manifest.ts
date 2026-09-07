import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RYVON",
    short_name: "RYVON",
    description: "Painel operacional de evolução física",
    start_url: "/hoje",
    display: "standalone",
    background_color: "#F7F9FC",
    theme_color: "#2378F3",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
