const pwaConfig = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Puedes agregar más opciones aquí si lo deseas
};

module.exports = pwaConfig;
