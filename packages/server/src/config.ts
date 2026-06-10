export default {
  client: {
    relative_build_directory: "./client",
    routes: ["/join", "/new-game", "/funds", "/bank", "/history", "/settings"]
  },
  server: {
    allowed_origins: process.env.SERVER_ALLOWED_ORIGINS?.split(","),
    port: process.env.PORT || 5000,
    inject_fake_data: process.env.INJECT_FAKE_DATA?.toLowerCase() === "true"
  }
};
