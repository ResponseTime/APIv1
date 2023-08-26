require("dotenv").config();
const express = require("express");
const app = express();
const fileupload = require("express-fileupload");
const sharp = require("sharp");
const nodemailer = require("nodemailer");
const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileupload());

app.post("/upload", (req, res) => {
  const { image } = req.files;
  const ftype = ["jpg", "png", "gif", "jpeg"];
  if (ftype.includes(image.name.split(".")[image.name.split(".").length - 1])) {
    image.mv(__dirname + "/uploads/" + image.name);
    res.json({ upload: 1 });
  } else {
    res.json({ upload: 0 });
  }
});

app.post("/process/gaussian/background", async (req, res) => {
  const { bg, fg } = req.files;
  await bg.mv(__dirname + "/uploads/" + bg.name);
  await fg.mv(__dirname + "/uploads/" + fg.name);
  let back = sharp(__dirname + "/uploads/" + bg.name);
  back.blur(20);
  let fore = sharp(__dirname + "/uploads/" + fg.name);
  await back
    .composite([{ input: await fore.toBuffer(), top: 0, left: 600 }])
    .toFile(__dirname + "/uploads/" + "out.jpeg");
  res.download(__dirname + "/uploads/" + "out.jpeg");
});

app.get("/late", (req, res) => {
  setTimeout(() => {
    console.log("This is late reply");
  }, 5000);
  res.send("sent your req it will be processed");
});

app.post("/remind", (req, res) => {
  const { time, msg } = req.body;
  var mailOptions = {
    from: "aayush.bhattacharjee2002@gmail.com",
    to: "callraja2002@gmail.com",
    subject: "Sending Email using Node.js",
    text: msg,
  };
  setTimeout(() => {
    transpoter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }, time * 1000);
  res.json({ ack: `you will get email in ${time}` });
});
app.listen(5000, () => {
  console.log("runnin");
});
