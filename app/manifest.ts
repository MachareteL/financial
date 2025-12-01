import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lemon",
    short_name: "Lemon",
    description: "Finanças Inteligentes para Casais",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#84cc16",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
