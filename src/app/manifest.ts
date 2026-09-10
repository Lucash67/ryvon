import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RYVON",
    short_name: "RYVON",
    description: "Evolução em movimento — painel operacional de evolução física",
    start_url: "/hoje",
    display: "standalone",
    background_color: "#050A14",
    theme_color: "#050A14",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
