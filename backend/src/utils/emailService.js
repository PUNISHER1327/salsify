const nodemailer = require('nodemailer');

const createTransporter = async () => {
    if (cachedTransporter) return cachedTransporter;

    // Use environment variables for real SMTP if available
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        cachedTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        return cachedTransporter;
    }

    // Fallback to Ethereal for testing
    console.log('No SMTP config found, using Ethereal...');
    const testAccount = await nodemailer.createTestAccount();

    cachedTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    return cachedTransporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = await createTransporter();

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"SaaS Platform" <noreply@saasplatform.com>',
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        return null; // Return null on error, don't throw to avoid crashing cron jobs
    }
};

const sendTaskReminderEmail = async (user, tasks) => {
    const taskListHtml = tasks.map(t => `<li><strong>${t.title}</strong> - due ${new Date(t.dueDate).toLocaleDateString()}</li>`).join('');

    return await sendEmail({
        to: user.email,
        subject: `Reminder: You have ${tasks.length} pending tasks`,
        html: `
            <h3>Hello ${user.name},</h3>
            <p>You have the following tasks pending:</p>
            <ul>${taskListHtml}</ul>
            <p>Please log in to your dashboard to complete them.</p>
        `
    });
};

const sendInvoiceReminderEmail = async (client, invoice) => {
    return await sendEmail({
        to: client.email || 'client@example.com', // Fallback if client has no email
        subject: `Payment Reminder: Invoice #${invoice._id}`,
        html: `
            <h3>Hello ${client.name},</h3>
            <p>This is a friendly reminder that invoice <strong>#${invoice._id}</strong> for <strong>$${invoice.amount}</strong> was due on ${new Date(invoice.dueDate).toLocaleDateString()}.</p>
            <p>Please arrange for payment at your earliest convenience.</p>
            <p>Thank you!</p>
        `
    });
};

module.exports = {
    sendEmail,
    sendTaskReminderEmail,
    sendInvoiceReminderEmail
};
