const mongoose = require("mongoose");

const DB = process.env.DB.replace("<db_password>", process.env.DB_PASSWORD);

module.exports = async function connection() {
  try {
    await mongoose.connect(DB);
    console.log("DB CONECTION");
  } catch (error) {
    console.log(error);
  }
};
