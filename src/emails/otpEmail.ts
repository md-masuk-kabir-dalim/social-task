export const otpEmail = (username: string, randomOtp: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #eef2f7; margin: 0; padding: 0; line-height: 1.6;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);">
        <div style="background-color: #1e90ff; background-image: linear-gradient(135deg, #1e90ff, #28a745); padding: 35px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 700; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);">OTP Verification</h1>
        </div>
        <div style="padding: 25px 20px; text-align: center;">
            <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello <strong>${username}</strong>,</p>
            <p style="font-size: 17px; color: #333333; margin-bottom: 25px;">Your OTP for verifying your account is:</p>
            <p style="font-size: 38px; font-weight: bold; color: #1e90ff; margin: 25px 0; padding: 15px 25px; background-color: #e6f0ff; border-radius: 10px; display: inline-block; letter-spacing: 6px;">${randomOtp}</p>
            <p style="font-size: 15px; color: #555555; margin-bottom: 25px; max-width: 420px; margin-left: auto; margin-right: auto;">
                Please enter this OTP to complete the verification process. It is valid for 5 minutes.
            </p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dfe3e8;">
                <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        </div>
        <div style="background-color: #f3f5f9; padding: 12px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};