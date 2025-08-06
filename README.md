# AI Email Sender

A full-stack application that generates professional emails using AI (Groq API) and sends them via email. Built with Node.js, Express, and vanilla JavaScript.

## Features

- 🤖 **AI-Powered Email Generation** - Uses Groq API to generate professional emails
- 📧 **Email Sending** - Send emails to multiple recipients via Nodemailer
- ✏️ **Editable Content** - Edit generated emails before sending
- 🎨 **Modern UI** - Clean, responsive interface with animations
- 🚀 **Real-time Feedback** - Loading states, toast notifications, and status updates

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Email Configuration (Gmail SMTP example)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Server Configuration
PORT=3000
```

### 3. Get API Keys

#### Groq API Key:
1. Visit [https://console.groq.com/](https://console.groq.com/)
2. Sign up/Login
3. Go to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### Gmail App Password (for email sending):
1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this app password (not your regular password) in `.env`

### 4. Run the Application
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

### 5. Access the Application
Open your browser and navigate to: `http://localhost:3000`

## Usage

1. **Enter Recipients** - Add email addresses (comma-separated for multiple)
2. **Write Prompt** - Describe what kind of email you want (e.g., "Write a follow-up email after a job interview")
3. **Generate Email** - Click "Generate Email" to create AI-powered content
4. **Edit Content** - Modify the subject and body as needed
5. **Send Email** - Click "Send Email" to deliver to recipients

## Example Prompts

- "Write a professional follow-up email after a job interview"
- "Create a thank you email for a client after project completion"
- "Draft a meeting request email for next week"
- "Write an apology email for a delayed delivery"
- "Create a welcome email for new team members"

## Project Structure

```
ai-email-sender/
├── server.js          # Express server and API routes
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (create this)
├── README.md         # This file
└── public/           # Frontend files
    ├── index.html    # Main HTML file
    ├── style.css     # Styling
    └── script.js     # Frontend JavaScript
```

## API Endpoints

- `GET /` - Serve main application
- `POST /api/generate-email` - Generate email using AI
- `POST /api/send-email` - Send email to recipients
- `GET /api/health` - Health check

## Technologies Used

- **Backend**: Node.js, Express.js
- **AI Integration**: Groq SDK (Llama 3 model)
- **Email Service**: Nodemailer
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with gradients and animations

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords, not regular passwords for email
- Keep your API keys secure
- The app uses CORS middleware for cross-origin requests

## Troubleshooting

### Common Issues:

1. **"Server connection failed"**
   - Make sure the server is running (`npm start`)
   - Check if port 3000 is available

2. **"Failed to generate email"**
   - Verify your Groq API key in `.env`
   - Check your internet connection
   - Ensure you have API credits remaining

3. **"Failed to send email"**
   - Verify email credentials in `.env`
   - Make sure you're using an app password (for Gmail)
   - Check if 2FA is enabled on your email account

4. **Dependencies issues**
   - Delete `node_modules` and run `npm install` again
   - Make sure you have Node.js installed (v14+ recommended)

## Development

To contribute or modify:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🚨 Important for Assignment Submission

**CRITICAL**: Make sure your server is running when you submit!

Run this command and keep it running:
```bash
npm start
```

The application should be accessible at `http://localhost:3000` for your assignment submission.

## Assignment Submission Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file configured with valid API keys
- [ ] Server is running (`npm start`)
- [ ] Application accessible at `http://localhost:3000`
- [ ] Groq API key is working (test email generation)
- [ ] Email sending is working (test with your email)
- [ ] All features tested: generate → edit → send

## Demo Script for Testing

1. Start the server: `npm start`
2. Open browser to `http://localhost:3000`
3. Enter your email in recipients
4. Test prompt: "Write a thank you email to a client for their business"
5. Click "Generate Email"
6. Edit the content if needed
7. Click "Send Email"
8. Check your inbox for the sent email

**Remember**: Keep the server running during your submission!