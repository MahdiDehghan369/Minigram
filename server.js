const app = require("./app");
const mongoose = require("mongoose");
const config = require("./utils/config");

const startServer = async () => {
  try {
    const mongoUrl = config.mongodb.url;

    await mongoose.connect(mongoUrl);
    console.log("✅ MongoDB connected successfully");

    app.listen(config.port, () => {
      console.log(`🚀 Server is running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:");
    console.error(err.message);
    process.exit(1);
  }
};

startServer();
