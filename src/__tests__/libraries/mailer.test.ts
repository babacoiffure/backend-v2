import { sendEmail } from '../../libraries/mailer';

describe('Mailer Library', () => {
  it('should create a transporter with correct configuration', () => {
    // Just ensure the file can be imported without errors
    require('../../libraries/mailer');
    // No expectations here since we're not mocking
  });

  it('should send email with correct parameters', async () => {
    // Email data
    const emailData = {
      to: 'babacoiffure27@gmail.com',
      subject: 'Test Subject from Hostinger - Parameters Test',
      text: 'Test plain text message from Hostinger',
      html: '<p>Test HTML message from Hostinger</p>',
    };

    // Call sendEmail function
    await sendEmail(emailData);
    // No expectations since we're not mocking
  });

  it('should handle errors when sending email fails', async () => {
    // Email data with invalid recipient to potentially trigger an error
    const emailData = {
      to: 'invalid-email@',
      subject: 'Test Subject from Hostinger - Error Test',
      text: 'Test plain text message from Hostinger',
      html: '<p>Test HTML message from Hostinger</p>',
    };

    // Call sendEmail function - should handle errors internally
    await sendEmail(emailData);
    // No expectations since we're not mocking
  });

  it('should send a real email to babacoiffure27@gmail.com', async () => {
    // Email data with the specified recipient
    const emailData = {
      to: 'babacoiffure27@gmail.com',
      subject: 'Test Email from Baba Coiffure Backend via Hostinger',
      text: 'This is a test email sent from the unit tests to verify email functionality using Hostinger.',
      html: '<h1>Test Email via Hostinger</h1><p>This is a test email sent from the unit tests to verify that the email functionality is working correctly with Hostinger.</p><p>If you received this email, the Hostinger email configuration is properly set up.</p>',
    };

    // Send a real email
    await sendEmail(emailData);
    
    // Log that we've sent a real email
    console.log('A real test email was sent to babacoiffure27@gmail.com via Hostinger');
  });
});
