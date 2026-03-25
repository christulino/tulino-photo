const express = require('express');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Check for Resend API key
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Contact form is not configured.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const toEmail = process.env.CONTACT_EMAIL || 'tulinophoto@gmail.com';

  try {
    await resend.emails.send({
      from: 'Tulino Photography <onboarding@resend.dev>',
      to: toEmail,
      replyTo: email,
      subject: `New inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'Failed to send message. Please email directly.' });
  }
});

// Catch-all: serve index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Tulino Photography running on port ${PORT}`);
});
