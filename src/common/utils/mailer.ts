import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (to: string, token: string) => {
    // Determine the base URL 
    const baseUrl = process.env.ISSUER || 'http://localhost:8000';
    const verifyLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #3b82f6; text-align: center;">Verify Your Email Address</h2>
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #333; font-size: 16px;">Welcome! Please click the button below to verify your email address and activate your account.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyLink}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">If you didn't create this account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">Or copy and paste this link into your browser:<br/><a href="${verifyLink}" style="color: #3b82f6;">${verifyLink}</a></p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"Auth Service" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Verify your Email - Auth Service',
            html: htmlContent,
        });
        console.log(`Verification email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending verification email to ${to}:`, error);
        // We do not throw here, so signup doesn't fail just because email delivery takes a few seconds or errors
        // But in a strict system, you might want to throw an error.
    }
};
