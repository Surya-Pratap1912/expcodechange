const Expanse = require("../models/expanse");
const User = require("../models/users");

const dwnContent = require("../models/downloadedFiles");
const S3Services = require("../services/s3services");
const mongoose = require("mongoose");
const { startSession } = require("mongoose");

const puppeteer = require("puppeteer");
const expanse = require("../models/expanse");

exports.downloadExpanseAsPdf = async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const pdfBuffer = await page.pdf();
    await browser.close();

    res.contentType("application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.downloadExpanse = async (req, res, next) => {
  try {
    const expanses = await Expanse.find({ userId: req.user._id });
    const strData = JSON.stringify(expanses);
    const fileName = `Expanse_${req.user.userName}/${new Date()}.txt`;
    const fileUrl = await S3Services.uploadtos3(fileName, strData);

    await dwnContent.create({
      fileUrl: fileUrl,
      userId: req.user,
    });

    res.status(200).json({ fileUrl, success: true });
  } catch (err) {
    res.status(500).json({ fileUrl: "", success: false });
  }
};
exports.addExpanse = async function (req, res, next) {
  const session = await startSession();
  session.startTransaction();
  try {
    const { amt, des, cat } = req.body;

    req.user.totalExpanse = req.user.totalExpanse + +amt;
    await req.user.save();

    const createExpanse = new Expanse({
      amt: amt,
      des: des,
      cat: cat,
      userId: req.user._id,
    });

    await createExpanse.save();
    const obj = {
      amt,
      des,
      cat,
    };
    res.json(obj);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getExpanse = async (req, res, next) => {
  try {
    const { email, userName, isPremium, totalExpanse } = req.user;
    await expanse.find({ userId: req.user._id }).then(async (exp) => {
      if (!exp) exp = [];
      let urls = await dwnContent.find({ userId: req.user._id });
      if (urls) {
        if (urls.length > 5) {
          urls = urls.slice(-5);
        }
      } else {
        urls = [];
      }

      if (req.user.isPremium){
      const arr = exp;
        res.json({ arr, userName, isPremium, totalExpanse, urls });
      }
      else {
        const arr = exp.length > 10 ? exp.subarray(-10) : exp;
        res.json({ arr, userName, isPremium, totalExpanse });
      }
    });
  } catch (err) {
    res.send("<h1>error while getting response from the server</h1>");
  }
};

exports.deleteExpanse = async (req, res, next) => {
  const prodId = req.params.prodId;
  Expanse.findById(prodId)
    .then(async (exp) => {
      User.findById(req.user._id).then(async (user) => {
        user.totalExpanse = user.totalExpanse - +exp.amt;
        await user.save();
      });
      await Expanse.findByIdAndDelete(prodId);
      res.send("deleted successfully");
    })
    .catch((err) => {
      res.status(500).json({ message: " internal error", err });
    });
};

exports.updateExpanse = async (req, res, next) => {
  const ExpanseId = req.params.prodId;
  const { amt, des, cat } = req.body;
  Expanse.findById(ExpanseId)
    .then(async (data) => {
      const change = +amt - +data.amt;
      User.findById(data.userId).then(async (user) => {
        user.totalExpanse = user.totalExpanse + +change;
      });

      data.amt = amt;
      data.des = des;
      data.cat = cat;

      return data.save();
    })
    .then(async () => {
      res.send("updated successfully");
    })
    .catch((err) => {
      res.status(500).json({ message: " internal error", err });
    });
};
