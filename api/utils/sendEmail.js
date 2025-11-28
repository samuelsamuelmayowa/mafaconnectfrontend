const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // or your mail server
    // port: 587,
    secure: false,
    auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSCODE
        },
});


const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"MafaConnect" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
// exports.sendEmail = async ({ to, subject, html }) => {
//   return transporter.sendMail({
//     from: `"MafaConnect" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };
// // const sendEmail = async (to, subject, text) => {
//     const transporter = nodemailer.createTransport({
//         service: "gmail", // or use smtp
//         auth: {
//             user: "fpasamuelmayowa51@gmail.com",
//             pass: "rwui ggdt mhyc rzpz",
//         },
//     });

//     exports.sendEmail = async ({ to, subject, html }) => {
//         return transporter.sendMail({
//             from: `"MafaConnect" <${process.env.EMAIL_USER}>`,
//             to,
//             subject,
//             html,
//         });
//     };
// }
