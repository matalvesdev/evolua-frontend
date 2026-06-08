import("./prebundled/packaged-main.mjs").catch((error) => {
  console.error("packaged entry failed", error);
  process.exit(1);
});
