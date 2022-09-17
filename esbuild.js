const esbuild = require('esbuild');
const { dtsPlugin } = require('esbuild-plugin-d.ts');

esbuild
  .build({
    entryPoints: [
      "./src/index.ts"
    ],
    bundle: true,
    minify: false,
    plugins: [dtsPlugin()],
    watch: process.argv[2] === 'watch',
    sourcemap: process.env.NODE_ENV !== "production",
    target: ["chrome58", "firefox57"],
    outdir: "./dist",
    define: {
      "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
      "global": "window",
    }
  })
  .catch((error) => {
    console.error(error.toString());
    process.exit(1);
  });
