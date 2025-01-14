const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Contributor = mongoose.model("Contributor");
const Doubt = mongoose.model("Doubt");
const Contact = mongoose.model("Contact");
const EventForm = mongoose.model("EventForm");
const Feedback = mongoose.model("Feedback");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../middleware/requireSignin");
const requireAdmin = require("../middleware/adminlogin");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { EMAIL, GPASS } = require("../config/keys");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mykyadav2003@gmail.com",
    pass: GPASS,
  },
});

router.post("/contribute", requireLogin, async (req, res) => {
  try {
    const {
      semester,
      subjectName,
      fileLinks,
      pdfDescription,
      // Add other required fields here
    } = req.body;

    if (
      !semester ||
      !subjectName ||
      !fileLinks ||
      !pdfDescription
    ) {
      return res
        .status(422)
        .json({ error: "Please fill in all required fields." });
    }

    const contribution = new Contributor({
      semester,
      subjectName,
      fileLinks,
      pdfDescription,
      postedBy: req.user,
    });

    // Save the contribution
    console.log(req.user);
    await contribution.save();

    res.status(201).json({ message: "Contribution submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting contribution." });
  }
});
router.post("/doubt", requireLogin, async (req, res) => {
  try {
    const {
      code,
      semester,
      subjectName,
      unitName,
      author,
      doubt,
      // Add other required fields here
    } = req.body;
    if (!doubt) {
      return res
        .status(422)
        .json({ error: "Please fill in all required fields." });
    }

    const doubts = new Doubt({
      code,
      semester,
      subjectName,
      unitName,
      author,
      doubt,
      postedBy: req.user,
    });

    // Save the contribution
    await doubts.save();

    transporter.sendMail({
      from: "ys751693@gmail.com", 
      to: "ys751693@gmail.com", 
      subject: "New Doubt Submitted",
      html: `
        <h1>New Doubt Submitted</h1>
        <p>Code: ${code}</p>
        <p>Semester: ${semester}</p>
        <p>Subject: ${subjectName}</p>
        <p>Unit: ${unitName}</p>
        <p>Author: ${author}</p>
        <p>Doubt: ${doubt}</p>
        <p>Posted By Name: ${req.user.name}</p>
        <p>Posted By Email: ${req.user.email}</p>
      `,
    });

    res.status(201).json({ message: "Doubt submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting contribution." });
  }
});
router.post("/contact", requireLogin, async (req, res) => {
  try {
    const {
      name,
      email,
      message,
    } = req.body;
    if (!email || !name || !message) {
      return res
        .status(422)
        .json({ error: "Please fill in all required fields." });
    }

    const contacts = new Contact({
      name,
      email,
      message,
      postedBy: req.user,
    });

    // Save the contribution
    await contacts.save();

    transporter.sendMail({
      from: "ys751693@gmail.com", // Your email address
      to: "ys751693@gmail.com", // Your email address
      subject: "Someone tried to reach you (Contact Us Form)",
      html: `
        <h1>New Contact Submitted</h1>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Message: ${message}</p>
   
        <p>Posted By Name: ${req.user.name}</p>
        <p>Posted By Email: ${req.user.email}</p>
      `,
    });

    res
      .status(201)
      .json({ message: "Contact Us form  submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting Contact Us Form." });
  }
});

router.post("/event-form", async (req, res) => {
  try {
    const { title, description, date, profilePic, link, extra } = req.body;

    // Define the static email addresses
    const staticEmails = ["mykyadav17112003@gmail.com", "kauranidivya@gmail.com", "sojitradarshitpiyushbhai@gmail.com", "harshsonaiya09@gmail.com", "iamaastha87@gmail.com", "tvjcoder414@gmail.com"];

    // Create a new EventForm instance with the form data
    const eventForm = new EventForm({
      title,
      description,
      date,
      profilePic,
      link,
      extra,
      timestamp: new Date(),
    });

    // Save the new EventForm to the database
    await eventForm.save();

    // Send emails to the static email addresses
    const mailOptions = {
      from: "mykyadav2003@gmail.com", // Correct the sender email
      to: staticEmails,
      subject: "Event Details",
      text: `Event Title: ${title}\nDescription: ${description}\nDate: ${date}\nLink: ${link}\n`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Respond with a success message
    res.status(201).json({ message: "Form submitted successfully!" });
  } catch (error) {
    // Handle errors
    console.error("Error submitting form:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/event-forms", async (req, res) => {
  try {
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    const eventForms = await EventForm.find({
      timestamp: { $gte: sevenDaysAgo.toISOString() }, // Convert to ISO string
    });

    console.log("Fetched Event Forms:", eventForms);
    res.json(eventForms);
  } catch (error) {
    console.error("Error in router:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/feedback", requireLogin, async (req, res) => {
  try {
    const {
      feedback,
      rating,

      // Add other required fields here
    } = req.body;
    if (!feedback) {
      return res
        .status(422)
        .json({ error: "Please fill in all required fields." });
    }

   
    const feedbacks = new Feedback({
      feedback,
      rating,

      postedBy: req.user,
    });

    // Save the contribution
    await feedbacks.save();
    const stars = "⭐".repeat(rating);
    transporter.sendMail({
      from: "ys751693@gmail.com", // Your email address
      to: ["ys751693@gmail.com", "kauranidivya@gmail.com", "sojitradarshitpiyushbhai@gmail.com"], // Your email address
      subject: "New Feedback Recieved",
      html: `
      <div style="text-align: center;">
      <img src=${req.user.profilePic} style="border-radius: 50%; max-width: 200px;">
      <h2 style="color: purple;">${req.user.name}</h2>
      <h3 style="color: purple;">${req.user.email}</h3>
      <h3><span >Feedback:</span>  ${feedback}</h3>
      <h3><span >Rating:</span> ${stars}</h3>
    </div>
        
      `,
    });

    res.status(201).json({ message: "Doubt submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting contribution." });
  }
});

router.get("/feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving feedbacks." });
  }
});

module.exports = router;
