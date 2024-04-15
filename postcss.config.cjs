/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

// Change to .cjs and to module.exports will fix ERR_UNSUPPORTED_ESM_URL_SCHEME error on Windows
// export default config;
module.exports = config