const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const Groq = require('groq-sdk');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files with correct MIME types
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// Specific routes for CSS and JS files (fallback)
app.get('/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Initialize Nodemailer
const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API endpoint to generate email using Groq
app.post('/api/generate-email', async (req, res) => {
  try {
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
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404 for all other routes
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📧 AI Email Sender Application Started`);
  console.log(`⚠️  Make sure to configure your .env file with API keys`);
  console.log(`📁 Serving static files from 'public' directory`);
});