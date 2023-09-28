const nodemailer = require("nodemailer");
const emailConfig = require("../config/emails");
const fs = require("fs");
const util = require("util");
const ejs = require("ejs");

const path = require("path");

// var transport = nodemailer.createTransport({
//   host: "sandbox.smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "6d33526c2ae53f",
//     pass: "8da388e96c931a",
//   },
// });
var transport = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

exports.enviarEmail = async (opciones) => {
  console.log("El mail se esta enviando tio!");
  console.log("opciones", opciones);
  //Leer el archivo para el mail
  // const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;
  // const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;//ORI
  const archivo = path.join(
    __dirname,
    "../views/emails",
    `${opciones.archivo}.ejs`
  );
  console.log("archivo", archivo);
  //Compilarlo
  // const compilado = ejs.compile(fs.readFileSync(archivo, "utf8"));
  // console.log("compilado", compilado);

  const compilado = ejs.compile(fs.readFileSync(archivo, "utf8"));
  console.log("compilado", compilado);

  //Crear el HTML

  const html = compilado({ url: opciones.url });
  console.log("html", html);

  //Configurar las opciones del email
  const opcionesEmail = {
    from: "Meeti <noreply@meeti.com>",
    to: opciones.usuario.email,
    subject: opciones.subject,
    html,
  };
  //Enviar el mail

  console.log("hasta casi el final del mail se esta ejecutando todo tio!");
  const sendEmail = util.promisify(transport.sendMail, transport);
  return sendEmail.call(transport, opcionesEmail);
};
