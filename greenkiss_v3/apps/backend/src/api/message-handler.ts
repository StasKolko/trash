export const getWelcomeMessage = () => ({
  message: process.env.VITE_MESSAGE ?? "С любовью, от backend Green Kiss 💚",
});
