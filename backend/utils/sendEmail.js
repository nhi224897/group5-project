const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Tạo một transporter (cấu hình dịch vụ gửi email)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, // Thường là 587 (TLS) hoặc 465 (SSL)
        secure: process.env.EMAIL_PORT == 465 ? true : false, // Sử dụng SSL nếu port là 465
        auth: {
            user: process.env.EMAIL_USER, // Tên người dùng SMTP
            pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng SMTP
        },
    });

    // 2. Định nghĩa nội dung email
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // Địa chỉ gửi
        to: options.email, // Địa chỉ nhận (được truyền vào options)
        subject: options.subject, // Chủ đề email
        text: options.message, // Nội dung dạng văn bản
        html: `<p>${options.message.replace(/\n/g, '<br>')}</p>`, // Nội dung dạng HTML
    };

    // 3. Gửi email
    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
