const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const axios = require("axios");
const PdfForm = mongoose.model("PdfForm");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../middleware/requireSignin");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { EMAIL, GPASS } = require("../config/keys");

router.post("/pdf-forms", async (req, res) => {
  try {
    const { code, sem, sub, unit, link, author, description, extra } = req.body;


    const newPdfForm = new PdfForm({
      code,
      sem,
      sub,
      unit,
      link,
      author,
      description,
      extra,
      timestamp: new Date(),
    });

    console.log(newPdfForm);
    console.log(new Date());
    await newPdfForm.save();

    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/pdf-forms/:code", async (req, res) => {
  try {
    const code = req.params.code;
    const pdfForm = await PdfForm.findOne({ code });

    if (!pdfForm) {
      return res
        .status(404)
        .json({ error: "PDF not found for the given code" });
    }
    const { sem, sub, unit, link, author, description, extra, timestamp } =
      pdfForm;
    res.json({ sem, sub, unit, link, author, description, extra, timestamp });
  } catch (error) {
    
    console.error("Error fetching PDF link:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
