var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: 'minabmza@gmail.com',
        pass: 'minabmz123'
    }
});

module.exports = {transporter}