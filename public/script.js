// DOM Elements
const recipientsInput = document.getElementById('recipients');
const promptInput = document.getElementById('prompt');
const generateBtn = document.getElementById('generateBtn');
const emailSection = document.getElementById('emailSection');
const emailSubject = document.getElementById('emailSubject');
const emailBody = document.getElementById('emailBody');
const sendBtn = document.getElementById('sendBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const statusSection = document.getElementById('statusSection');
const statusMessage = document.getElementById('statusMessage');
const toast = document.getElementById('toast');

// API Base URL
const API_BASE = '/api';

// Utility Functions
function showLoading(button) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading-spinner');
    
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    button.disabled = true;
}

function hideLoading(button) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading-spinner');
    
    btnText.style.display = 'block';
    spinner.style.display = 'none';
    button.disabled = false;
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusSection.className = `status-section status-${type}`;
    statusSection.style.display = 'block';
    statusSection.classList.add('fade-in');
}

function hideStatus() {
    statusSection.style.display = 'none';
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function validateRecipients(recipients) {
    const emails = recipients.split(',').map(email => email.trim());
    const invalidEmails = emails.filter(email => !validateEmail(email));
    
    return {
        valid: invalidEmails.length === 0,
        invalidEmails: invalidEmails,
        validEmails: emails.filter(email => validateEmail(email))
    };
}

// Main Functions
async function generateEmail() {
    const prompt = promptInput.value.trim();
    const recipients = recipientsInput.value.trim();
    
    // Validation
    if (!prompt) {
        showToast('Please enter a prompt for the email', 'error');
        promptInput.focus();
        return;
    }
    
    if (!recipients) {
        showToast('Please enter at least one recipient email', 'error');
        recipientsInput.focus();
        return;
    }
    
    // Validate email addresses
    const recipientValidation = validateRecipients(recipients);
    if (!recipientValidation.valid) {
        showToast(`Invalid email addresses: ${recipientValidation.invalidEmails.join(', ')}`, 'error');
        recipientsInput.focus();
        return;
    }
    
    showLoading(generateBtn);
    hideStatus();
    
    try {
        const response = await fetch(`${API_BASE}/generate-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate email');
        }
        
        if (data.success) {
            emailSubject.value = data.subject;
            emailBody.value = data.emailBody;
            
            emailSection.style.display = 'block';
            emailSection.classList.add('fade-in');
            
            showToast('Email generated successfully!');
            emailSection.scrollIntoView({ behavior: 'smooth' });
        }
        
    } catch (error) {
        console.error('Error generating email:', error);
        showToast(`Error: ${error.message}`, 'error');
        showStatus(`Failed to generate email: ${error.message}`, 'error');
    } finally {
        hideLoading(generateBtn);
    }
}

async function sendEmail() {
    const recipients = recipientsInput.value.trim();
    const subject = emailSubject.value.trim();
    const emailContent = emailBody.value.trim();
    
    // Validation
    if (!recipients || !subject || !emailContent) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate email addresses again
    const recipientValidation = validateRecipients(recipients);
    if (!recipientValidation.valid) {
        showToast(`Invalid email addresses: ${recipientValidation.invalidEmails.join(', ')}`, 'error');
        return;
    }
    
    showLoading(sendBtn);
    hideStatus();
    
    try {
        const response = await fetch(`${API_BASE}/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipients,
                subject,
                emailBody: emailContent
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to send email');
        }
        
        if (data.success) {
            showToast(`Email sent successfully to ${data.recipients.length} recipient(s)!`);
            showStatus(
                `✅ Email sent successfully!\n📧 Recipients: ${data.recipients.join(', ')}\n📝 Subject: ${subject}`,
                'success'
            );
            
            // Clear form after successful send
            setTimeout(() => {
                if (confirm('Email sent successfully! Would you like to clear the form for a new email?')) {
                    clearForm();
                }
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error sending email:', error);
        showToast(`Error: ${error.message}`, 'error');
        showStatus(`Failed to send email: ${error.message}`, 'error');
    } finally {
        hideLoading(sendBtn);
    }
}

function clearForm() {
    recipientsInput.value = '';
    promptInput.value = '';
    emailSubject.value = '';
    emailBody.value = '';
    emailSection.style.display = 'none';
    hideStatus();
    recipientsInput.focus();
}

// Event Listeners
generateBtn.addEventListener('click', generateEmail);
sendBtn.addEventListener('click', sendEmail);
regenerateBtn.addEventListener('click', generateEmail);

// Enter key support
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        generateEmail();
    }
});

recipientsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        promptInput.focus();
    }
});

// Auto-resize textarea
emailBody.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// Health check on page load
window.addEventListener('load', async () => {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            console.log('✅ Server is running properly');
        }
    } catch (error) {
        console.error('❌ Server connection failed:', error);
        showToast('Warning: Server connection failed. Please check if the server is running.', 'error');
    }
});

// Focus on first input when page loads
window.addEventListener('load', () => {
    recipientsInput.focus();
});

console.log('🚀 AI Email Sender initialized');
console.log('💡 Tips:');
console.log('- Use Ctrl+Enter in prompt field to generate email');
console.log('- Separate multiple recipients with commas');
console.log('- Edit the generated email before sending');