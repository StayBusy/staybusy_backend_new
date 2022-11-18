const sendEmail = require("./sendEmail");

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
  const resetURL = `${origin}/auth/reset-password?token=${token}&email=${email}`;

  console.log(resetURL)

  const message = `<p>Please reset password by clicking on the following link : 
  <a href="${resetURL}">Reset password</a> </p>`;

  return sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<h4> Hello, ${name}</h4>
    ${message}
    `,
  });
};

module.exports = sendResetPasswordEmail;
