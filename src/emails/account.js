const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {

  const msg = {
    to: email, // Change to your recipient
    from: 'akcinardoga@gmail.com', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: `Welcome to to the app ${name}`
  }
  
  sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
}

module.exports = {
  sendWelcomeEmail
}