require("dotenv").config();
const connectDB = require("./config/dbconn");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const corsoptions = require("./config/corsoptions")
const cookies = require("cookie-parser")
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000
connectDB();

app.use(cors(corsoptions))
app.use(cookies())
app.use(express.json())
app.use("/",require("./routes/root"))
app.use("/Auth",require("./routes/authRoutes"))
app.use("/users",require("./routes/usersRouters"))
app.use("/",express.static(path.join(__dirname , "" , "public")))

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
  mongoose.connection.on('error', (err) => {
    console.log(err);
  });


