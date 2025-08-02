import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function getModulePath(moduleName: string) {
  try {
    const moduleUrl = import.meta.resolve(moduleName);
    const modulePath = fileURLToPath(moduleUrl);
    return (
      modulePath
        .substring(0, modulePath.lastIndexOf("node_modules"))
        .replace(/\/+$/, "") || ""
    );
  } catch (error) {
    console.error(
      `Module ${moduleName} resolution failed:`,
      (error as Error).message,
    );
    return "";
  }
}

const prismaNodeModulesPath = `${getModulePath("@prisma/client")}/node_modules`;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      ".prisma/client/index-browser": `${prismaNodeModulesPath}/.prisma/client/index-browser.js`,
    }
  }
});
