import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    client: "src/client.tsx",
    adapters: "src/adapters.tsx",
  },
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  external: [
    "react",
    "react-dom",
    "@theme-kit/core",
    "@theme-kit/react",
    "@theme-kit/shadcn",
    "@theme-kit/bootstrap",
    "@theme-kit/daisyui",
    "@theme-kit/open-props",
    "@theme-kit/mui",
    "@theme-kit/chakra",
    "@theme-kit/antd",
    "@theme-kit/mantine",
  ],
});
