const app = require('./index'); // or './app' if your file is named app.js

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Local server running at http://localhost:${PORT}`);
});