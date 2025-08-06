const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Basic error handling for missing environment variables
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is missing from environment variables');
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_USER or EMAIL_PASS is missing from environment variables');
}

// Initialize services with error handling
let groq = null;
let transporter = null;

try {
  const Groq = require('groq-sdk');
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  console.log('✅ Groq initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Groq:', error.message);
}

try {
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('✅ Nodemailer initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Nodemailer:', error.message);
}

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    groq: groq ? 'Connected' : 'Not available',
    email: transporter ? 'Connected' : 'Not available'
  });
});

// API endpoint to generate email using Groq
app.post('/api/generate-email', async (req, res) => {
  try {
    if (!groq) {
      return res.status(500).json({ error: 'Groq service is not available' });
    }

    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Generating email for prompt:', prompt);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional email writer. Generate well-structured, professional emails based on the user\'s prompt. Include a clear subject line and properly formatted email content. Respond in the following format:\n\nSUBJECT: [subject line]\n\nEMAIL:\n[email content]'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1000
    });

    const generatedContent = completion.choices[0]?.message?.content || '';
    
    // Parse subject and email content
    const subjectMatch = generatedContent.match(/SUBJECT:\s*(.+)/);
    const emailMatch = generatedContent.match(/EMAIL:\s*([\s\S]+)/);
    
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Generated Email';
    const emailBody = emailMatch ? emailMatch[1].trim() : generatedContent;

    console.log('Email generated successfully');

    res.json({
      success: true,
      subject: subject,
      emailBody: emailBody,
      fullContent: generatedContent
    });

  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ 
      error: 'Failed to generate email', 
      details: error.message 
    });
  }
});

// API endpoint to send email
app.post('/api/send-email', async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({ error: 'Email service is not available' });
    }

    const { recipients, subject, emailBody } = req.body;

    if (!recipients || !subject || !emailBody) {
      return res.status(400).json({ error: 'Recipients, subject, and email body are required' });
    }

    console.log('Sending email to:', recipients);

    // Parse recipients (can be comma-separated)
    const recipientList = recipients.split(',').map(email => email.trim());

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientList,
      subject: subject,
      html: emailBody.replace(/\n/g, '<br>')
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      recipients: recipientList
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📧 AI Email Sender Application Started`);
  console.log(`Environment variables loaded:`, {
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'Set' : 'Missing',
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Missing',
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail'
  });
});

module.exports = app;