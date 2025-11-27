import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail", // or use smtp
        auth: {
            user: "fpasamuelmayowa51@gmail.com",
            pass: "rwui ggdt mhyc rzpz",
        },
    });

    await transporter.sendMail({
        from: `"MAFACONECT" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Order Placed Successfully",
        html: `
      <h2>Order Confirmation</h2>
      <p>Your order has been placed successfully.</p>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <p><strong>Status:</strong> Reserved</p>
      <p>Please complete your payment within allowed time.</p>
    `,
    });
};

export default sendEmail;
