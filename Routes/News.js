const express = require('express');
const router = express.Router();
const Newsletter = require('../Model/News');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config()
// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  // Configure your email service here
  // For example, using Gmail:
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(process.env.EMAIL_USER,process.env.EMAIL_PASS)
    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return res.status(400).json({ error: 'Email is already subscribed' });
      } else {
        // Re-subscribe if previously unsubscribed
        existingSubscriber.subscribed = true;
        existingSubscriber.subscriptionDate = Date.now();
        await existingSubscriber.save();
        return res.status(200).json({ message: 'Successfully re-subscribed to newsletter' });
      }
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create new subscriber
    const newSubscriber = new Newsletter({
      email,
      verificationToken,
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    
    await newSubscriber.save();
    
    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URI || 'http://localhost:5173'}verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your newsletter subscription',
      html: `
        <h1>Verify your email</h1>
        <p>Thank you for subscribing to our newsletter. Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'Successfully subscribed! Please check your email to verify your subscription.' 
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'An error occurred while subscribing to the newsletter' });
  }
});

// Verify email
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    console.log(token);
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    const subscriber = await Newsletter.findOne({ 
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });
    
    if (!subscriber) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    subscriber.verified = true;
    subscriber.verificationToken = undefined;
    subscriber.verificationExpires = undefined;
    
    await subscriber.save();
    
    res.status(200).json({ message: 'Email verified successfully' });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'An error occurred while verifying your email' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const subscriber = await Newsletter.findOne({ email });
    
    if (!subscriber) {
      return res.status(400).json({ error: 'Email not found in our subscribers list' });
    }
    
    subscriber.subscribed = false;
    await subscriber.save();
    
    res.status(200).json({ message: 'Successfully unsubscribed from newsletter' });
    
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'An error occurred while unsubscribing from the newsletter' });
  }
});

module.exports = router;