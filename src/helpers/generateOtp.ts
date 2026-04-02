const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiry to 5 minutes from now
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  return { otp, expiry };
};

export default generateOtp;
