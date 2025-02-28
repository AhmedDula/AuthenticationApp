const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const register = async (req, res) => {
  const { First_Name, Last_Name, Email, Password } = req.body;
  if (!First_Name || !Last_Name || !Email || !Password) {
    res.status(400).json({ message: "ALl Fields Required" });
  }
  const founUser = await Users.findOne({ Email }).exec();
  if (founUser) {
    res.status(401).json({ message: "The User Already Exists" });
  }

  if (typeof Password !== "string" || Password.trim() === "") {
    res.status(401).json({ message: "Invalid Password" });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);

  const User = await Users.create({
    First_Name,
    Last_Name,
    Email,
    Password: hashedPassword,
  });

  const accessToken = JWT.sign(
    {
      UserInfo: {
        id: User._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = JWT.sign(
    {
      UserInfo: {
        id: User._id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("JWT", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    MaxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    accessToken,
    First_Name: User.First_Name,
    Last_Name: User.Last_Name,
    Email: User.Email,
  });
};
const login = async (req, res) => {
  const { Email, Password } = req.body;
  if (!Email || !Password) {
    res.status(400).json({ message: "ALl Fields Required" });
  }
  const founUser = await Users.findOne({ Email }).exec();
  if (!founUser) {
    res.status(401).json({ message: "The User dose Not Exists !" });
  }

  // if (typeof Password !== "string" || Password.trim() === "") {
  //    res.status(401).json({ message: "Invalid Password" });
  // }

  const match = await bcrypt.compare(Password, founUser.Password);

  if (!match) {
    res.status(401).json({ message: "Wrong Email or Password!" });
  }

  const accessToken = JWT.sign(
    {
      UserInfo: {
        id: founUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1m" }
  );
  const refreshToken = JWT.sign(
    {
      UserInfo: {
        id: founUser._id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("JWT", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    MaxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    accessToken,
    Email: founUser.Email,
  });
};

const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.JWT) res.status(401).json({ message: "Unauthorized" });
  const refreshToken = cookies.JWT;
  JWT.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) res.status(403).json({ message: "forbidden" });
      const founUser = await Users.findById(decoded.UserInfo.id).exec();
      if (!founUser) res.status(401).json({ message: "Unauthorized" });
      const accessToken = JWT.sign(
        {
          UserInfo: {
            id: founUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1m" }
      );
      res.json(accessToken);
    }
  );
};
const logout = (req, res) => {
  const tokenJwt = req.cookies;
  if (!tokenJwt?.JWT) return res.status(201);
  res.clearCookie("JWT", {
    httpOnly: true,
    sameSite: true,
    secure: true,
  });
  res.json({ message: "Logout !" });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
