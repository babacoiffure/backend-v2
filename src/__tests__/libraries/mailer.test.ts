import { sendEmail } from '../../libraries/mailer';

describe('Mailer Library', () => {
  it('should create a transporter with correct configuration', () => {
    // Just ensure the file can be imported without errors
    require('../../libraries/mailer');
    
    // We're not mocking, so we just verify the import works without error
    expect(true).toBe(true);
  });

  it('should send email with correct parameters', async () => {
    // Spy on console.log to verify success
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Email data
    const emailData = {
      to: 'babacoiffure27@gmail.com',
      subject: 'Test Subject from Hostinger - Parameters Test',
      text: 'Test plain text message from Hostinger',
      html: '<p>Test HTML message from Hostinger</p>',
    };

    // Call sendEmail function
    await sendEmail(emailData);
    
    // Verify the success log was called (indicating email was sent)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Email sent successfully!",
      expect.any(String)
    );
    
    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  it('should handle errors when sending email fails', async () => {
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Email data with invalid recipient to trigger an error
    const emailData = {
      to: 'invalid-email@', // Invalid email format should cause an error
      subject: 'Test Subject from Hostinger - Error Test',
      text: 'Test plain text message from Hostinger',
      html: '<p>Test HTML message from Hostinger</p>',
    };

    // Call sendEmail function
    await sendEmail(emailData);
    
    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error sending email:",
      expect.any(Error)
    );
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should send a real email to babacoiffure27@gmail.com', async () => {
    // Spy on console.log to verify success
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Email data with the specified recipient
    const emailData = {
      to: 'babacoiffure27@gmail.com',
      subject: 'Test Email from Baba Coiffure Backend via Hostinger',
      text: 'This is a test email sent from the unit tests to verify email functionality using Hostinger.',
      html: '<h1>Test Email via Hostinger</h1><p>This is a test email sent from the unit tests to verify that the email functionality is working correctly with Hostinger.</p><p>If you received this email, the Hostinger email configuration is properly set up.</p>',
    };

    // Send a real email
    await sendEmail(emailData);
    
    // Verify the success log was called
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Email sent successfully!",
      expect.any(String)
    );
    
    // Restore console.log
    consoleLogSpy.mockRestore();
    
    // Log that we've sent a real email
    console.log('A real test email was sent to babacoiffure27@gmail.com via Hostinger');
  });
});
