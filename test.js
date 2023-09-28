const nodemailer = require("nodemailer");

// Configuración del transporte
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "6d33526c2ae53f",
    pass: "8da388e96c931a",
  },
});

// Opciones del correo electrónico
const opcionesEmail = {
  from: "Tu Nombre <tuemail@example.com>",
  to: "destinatario@example.com",
  subject: "Prueba de correo",
  text: "Este es un mensaje de prueba.",
};

// Enviar el correo electrónico
transport.sendMail(opcionesEmail, (error, info) => {
  if (error) {
    console.error("Error al enviar el correo:", error);
  } else {
    console.log("Correo enviado:", info.response);
  }
});
