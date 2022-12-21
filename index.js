const express = require("express");
const dotenv = require("dotenv");
const registerRouter = require('./router/registerRouter');

const auth = require("./modules/authModule");
const mongo = require("./connect");

dotenv.config();
mongo.connect();
const app = express();
// to parse req.body, to send the req.body from client to server
app.use(express.json());
app.use(cors())
app.use("/", (req, res, next) => {
  // Authentication
  var auth = {
    authorised: true,
  };
  if (auth.authorised) {
    console.log("Authorised");
    next();
  } else {
    console.log("Not Authorised");
    res.send({ msg: "Not Authorised" });
  }
});

app.use("/", auth.authenticateUser);
app.use("/register", registerRouter);


app.listen(process.env.PORT);

