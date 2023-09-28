const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
// var flash = require("connect-flash-plus");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const passport = require("./config/passport");
const router = require("./routes");

//Condifuración y modelado de la base de datos
const db = require("./config/db");
require("./models/Usuarios");
require("./models/Categorias");
require("./models/Comentarios");
require("./models/Grupos");
require("./models/Meeti");

db.sync()
  .then(() => console.log("DB Conectada!"))
  .catch((error) => console.log(error));

require("dotenv").config({ path: "variables.env" });
//Aplicación principal
const app = express();

//Body parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //true para q lea archivos

//Express validator (validación con bastantes funciones)
app.use(expressValidator());

//Habilitar EJS como template engine
app.use(expressLayouts);
app.set("view engine", "ejs");

//Ubicación vistas
app.set("views", path.join(__dirname, "./views"));

//Archivos estáticos
app.use(express.static("public"));

//Habilitar cookie parser
app.use(cookieParser());
//Crear la sesion
app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
  })
);
//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());
//Agrega Flash messages
app.use(flash());

//Middleware (usuario logueado, flash messages. fecha actual)
app.use((req, res, next) => {
  res.locals.usuario = { ...req.user } || null;

  res.locals.mensajes = req.flash();

  const fecha = new Date();
  res.locals.year = fecha.getFullYear();
  next();
});

//Routing
app.use("/", router());

//Agrega el puerto
app.listen(process.env.PORT, () => {
  console.log("El servidor está funcionando en el puerto: " + process.env.PORT);
});
