const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID =
  "51255296215-o3dnljo7n48p1cc3v2lstpidek3tppon.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
"1//041iEq_ldAh7BCgYIARAAGAQSNwF-L9IrnY52AJGGrte2abW39uSznn8Ms8waExS_zR0pOM7vbIWX0F7TskauVtDcvLB6uZemgpU";
  

const myOAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

myOAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

module.exports = async (email, subject, text) => {
  try {
    const accessToken = await myOAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      tls: { rejectUnauthorized: false },
      auth: {
        type: "oauth2",
        user: "16pratikshinde@gmail.com",
        // pass: procees.env.pass,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    await transport.sendMail({
      from: "16pratikshinde@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
  } catch (error) {
    return error;
  }
};
