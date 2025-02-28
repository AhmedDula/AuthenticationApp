const User = require("../models/Users");
const getAllUsers = async (req, res) => {
    const users = await User.find().select("-Password").lean();
    if (!users.length) {
      return res.status(400).json({ message: "No users found" });
    }
    res.json(users);
  };
  module.exports = {
    getAllUsers,
  };