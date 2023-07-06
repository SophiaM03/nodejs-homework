const mongoose = require("mongoose");

const app = require("./app");

const DB_HOST =
  "mongodb+srv://Sophia:9fpo0gR7ZRw5JzrO@cluster0.cxez1yk.mongodb.net/db-contacts?retryWrites=true&w=majority";

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(3000);
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
