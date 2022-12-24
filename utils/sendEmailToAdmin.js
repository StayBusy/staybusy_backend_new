const sendEmail = require('./sendEmail');

const sendEmailToAdmin = async ({ name, id, amount }) => {
  const message = `<p>${name} with id '${id}' made withdrawal of ${amount}</p>`;

  return sendEmail({
    to: 'admin@staybusy.com',
    subject: `Pending payment from ${name}`,
    html: `<h4> Hello, ${name}</h4>
          ${message}
      `,
  });
};

module.exports = sendEmailToAdmin;
