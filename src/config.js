const mongoose=require("mongoose");
const { use } = require("react");
const connect=mongoose.connect("mongodb://localhost:27017/greentripper");
// Check the connection status
connect
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
  // Define the User schema
const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,  // L'email doit être unique
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'] // Validation de l'email
      },
    password: {
      type: String,
      required: true,
      minlength: 6 // You can adjust this depending on your password policy
    }
  });
  const UserCollection = mongoose.model("Users", userSchema);
  // Schéma pour les empreintes carbone
const carbonSchema = new mongoose.Schema({
  distance: {
    type: Number,
    required: true,
  },
  transport: {
    type: String,
    required: true,
    enum: ["car", "plane", "train", "bus"],
  },
  passengers: {
    type: Number,
    required: true,
  },
  calculatedCarbon: {
    type: Number,
    required: true,
  },
});
  
  const CarbonCollection = mongoose.model("carbons", carbonSchema);


  // Export the collections
module.exports = {
  UserCollection,
  CarbonCollection
};