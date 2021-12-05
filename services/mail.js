const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config(); 

const CLIENT_ID = process.env.MAILER_CLIENT_ID ;
const CLIENT_SECRET = process.env.MAILER_CLIENT_SECRET ;
const REDIRECT_URI = process.env.MAILER_REDIRECT_URI;
const REFRESH_TOKEN = process.env.MAILER_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendMail = (recipient, subject, message, html, callback) => {

  oAuth2Client.getAccessToken(function(accessToken){
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "oAuth2",
          user: "mail.sender.do.not.reply@gmail.com",
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
    
      const mailOptions = {
        from: "mail sender <mail.sender.do.not.reply@gmail.com>",
        to: recipient,
        subject: subject,
        text: message,
        html: html,
      };
    
      transport.sendMail(mailOptions, function(error, result){
        callback(error, result);
      });
  });
};


module.exports = {
  sendMail,
};
