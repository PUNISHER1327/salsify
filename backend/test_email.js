const nodemailer = require('nodemailer');

async function main() {
    try {
        console.log('Creating test account...');
        const testAccount = await nodemailer.createTestAccount();
        console.log('Test account created:', testAccount.user);

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: '"Test" <test@example.com>',
            to: "bar@example.com",
            subject: "Hello",
            text: "Hello world?",
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

main();
