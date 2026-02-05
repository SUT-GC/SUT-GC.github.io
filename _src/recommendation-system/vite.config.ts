import path from "path";
import fs from "fs";
import { defineConfig, Plugin } from "vite";

/**
 * Vite plugin: HTML Include
 * Replaces <!-- @include path/to/file.html --> directives with file contents.
 * Paths are resolved relative to the project root.
 */
function htmlInclude(): Plugin {
  return {
    name: "html-include",
    transformIndexHtml: {
      order: "pre",
      handler(html: string) {
        return html.replace(
          /<!--\s*@include\s+([\w\-\/\.]+)\s*-->/g,
          (_match: string, filePath: string) => {
            const absPath = path.resolve(__dirname, filePath);
            if (!fs.existsSync(absPath)) {
              throw new Error(`[html-include] File not found: ${absPath}`);
            }
            return fs.readFileSync(absPath, "utf-8");
          }
        );
      },
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [htmlInclude()],
  build: {
    outDir: path.resolve(__dirname, "../../files/powerpoint/recommendation-system"),
    emptyOutDir: true,
  },
});
