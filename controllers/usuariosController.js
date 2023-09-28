const Usuarios = require("../models/Usuarios");
const enviarEmail = require("../handlers/emails");

////////////////////////DE GRUPOSCONTROLLER.JS///////////////
const path = require("path");
const fs = require("fs");

const multer = require("multer");
const shortid = require("shortid");

const configuracionMulter = {
  limits: { fileSize: 500000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, res, next) => {
      next(null, __dirname + "/../public/uploads/perfiles/");
    },
    filename: (req, file, next) => {
      const extension = file.mimetype.split("/")[1];
      next(null, `${shortid.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, next) {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      //El formato es valido
      next(null, true);
    } else {
      //El formato no es valido
      next(new Error("El formato no es válido"), false);
    }
  },
};

const upload = multer(configuracionMulter).single("imagen");
//Sube imagen en el servidor
exports.subirImagen = (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      console.log("error", error);
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          req.flash("error", "El archivo es muy grande");
        } else {
          req.flash("error", error.message);
        }
      } else if (error.hasOwnProperty("message")) {
        req.flash("error", error.message);
      }
      res.redirect("back");
      return;
    } else {
      next();
    }
  });
};
////////////////////////DE GRUPOSCONTROLLER.JS///////////////

exports.formCrearCuenta = (req, res, next) => {
  res.render("crear-cuenta", { nombrePagina: "Crea tu cuenta" });
};
exports.crearNuevaCuenta = async (req, res) => {
  const usuario = req.body;

  req
    .checkBody("confirmar", "El password confirmado no puede ir vacío")
    .notEmpty();
  req
    .checkBody("confirmar", "El password es diferente")
    .equals(req.body.password);

  //Leer los errores de express
  // const erroresExpress = req.validationErrors(); //VERSION ANTIGUA SEQUELIZE
  // const validationResult = await req.getValidationResult();
  // const erroresExpress = validationResult.array();
  // console.log("erroresExpressoriginal", erroresExpress);
  try {
    ///////////////////////MINE//////////////////////////////////////////
    const usuarioExistente = await Usuarios.findOne({
      where: { email: usuario.email },
    });
    if (usuarioExistente) {
      req.flash("error", "El correo electrónico ya está en uso"); //ORI
      // req.flash.addMessage({
      //   type: "error",
      //   text: "El correo electrónico ya está en uso",
      // });
      return res.redirect("/crear-cuenta");
    }
    ///////////////////////MINE//////////////////////////////////////////
    // const nuevoUsuario =
    await Usuarios.create(usuario);
    req.flash("exito", "Hemos creado el usuario!!!");
    //Generar URL de confirmación
    const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

    //Enviar email de confirmacion
    await enviarEmail.enviarEmail({
      usuario,
      url,
      subject: "Confirma tu cuenta de Meeti",
      archivo: "confirmar-cuenta",
    });
    // Flash Message y redireccionar
    // console.log("Usuario creado: ", nuevoUsuario);
    req.flash("exito", "Hemos enviado un E-mail, confirma tu cuenta"); //ORI
    // req.flash("success", "Hemos enviado un E-mail, confirma tu cuenta");
    // req.flash.addMessage({
    //   type: "success",
    //   text: "Hemos enviado un E-mail, confirma tu cuenta",
    // });
    res.redirect("/iniciar-sesion");
  } catch (error) {
    const validationResult = await req.getValidationResult();
    const erroresExpress = validationResult.array();

    // // //Extraer el message de los errores "error"
    // // const erroresSequelize = error.errors.map((err) => err.message);
    // // // console.log("erroresSequelize", erroresSequelize);
    // // //Extraer unicamente el msg de los errores
    // // const errExp = erroresExpress.map((err) => err.msg);
    // // // console.log("errExp", errExp);
    // // //Unirlos
    // // // const listaErrores = [...erroresSequelize, ...errExp];
    // // const listaErrores = [...erroresSequelize, ...errExp];
    // // console.log("listaErrores", listaErrores);
    // // req.flash("error", listaErrores);
    // // res.redirect("/crear-cuenta");

    const erroresSequelize = error.errors
      ? error.errors.map((err) => err.message)
      : [];
    const errExp = erroresExpress.map((err) => err.msg);
    const listaErrores = [...erroresSequelize, ...errExp];
    console.log("listaErrores", listaErrores);
    // req.flash(listaErrores);//ORI
    req.flash("error", listaErrores); //ORI
    // req.flash.addMessage({
    //   type: "error",
    //   text: listaErrores,
    // });
    res.redirect("/crear-cuenta");
  }
};
//Confirma la suscipción del usuario
exports.confirmarCuenta = async (req, res, next) => {
  //Verificar que el usuario existe
  const usuario = await Usuarios.findOne({
    where: { email: req.params.correo },
  });
  // console.log("req.params.correo", req.params.correo);
  // console.log("usuario", usuario);
  //Si no existe, redireccionar
  if (!usuario) {
    req.flash("exito", "No exite esa cuenta");
    res.redirect("/crear-cuenta");
    return next();
  }
  //Si existe, confirmar suscripción y redireccionar
  console.log("usuario.activo", usuario.activo);
  usuario.activo = 1;
  await usuario.save();
  req.flash("exito", "La cuenta se ha confirmado, ya puede iniciar sesión");
  res.redirect("/iniciar-sesion");
};

//Formulario para iniciar sesión
exports.formIniciarSesion = (req, res, next) => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar Sesion",
  });
};
//Muestra el formulario para editar el perfil
exports.formEditarPerfil = async (req, res, next) => {
  const usuario = await Usuarios.findByPk(req.user.id);
  res.render("editar-perfil", {
    nombrePagina: "Editar Perfil",
    usuario,
  });
};
//Almacena en la BD los cambios al perfil
exports.editarPerfil = async (req, res, next) => {
  const usuario = await Usuarios.findByPk(req.user.id);

  req.sanitize("nombre");
  req.sanitize("email");
  //Leer datos del form
  const { nombre, descripcion, email } = req.body;
  //Asignar los valores
  usuario.nombre = nombre;
  usuario.descripcion = descripcion;
  usuario.email = email;

  //Guardar en la base de datos para
  await usuario.save();
  req.flash("exito", "Cambios Guardados Correctamente");
  res.redirect("/administracion");
};
//Muestra el formulario para modificar el password
exports.formCambiarPassword = async (req, res, next) => {
  res.render("cambiar-password", {
    nombrePagina: "Cambiar Password",
  });
};
//Resisa si el password anterior es correcto y lo modifica por uno nuevo
exports.cambiarPassword = async (req, res, next) => {
  const usuario = await Usuarios.findByPk(req.user.id);
  //Verificar que el password anterior sea correcto
  if (!usuario.validarPassword(req.body.anterior)) {
    req.flash("error", "El password actual es incorrecto");
    res.redirect("/administracion");
    return next();
  }
  // console.log("todo bien");
  //Si el password es correcto, hashear el nuevo
  const hash = usuario.hashPassword(req.body.nuevo);
  // console.log("hash", hash);
  usuario.password = hash;
  //Guardar en la base de datos para
  await usuario.save();

  //Redireccionar
  req.logout(req.user, (err) => {
    if (err) return next(err);
    req.flash(
      "exito",
      "Password Modificado Correctamente, vuelve a iniciar sesión"
    );
    res.redirect("/iniciar-sesion");
  });
};
//Muestra el formulario para subir una imagen de perfil
exports.formSubirImagenPerfil = async (req, res, next) => {
  const usuario = await Usuarios.findByPk(req.user.id);
  //mostrar la vista
  res.render("imagen-perfil", {
    nombrePagina: "Subir Imagen Perfil",
    usuario,
  });
};

//Guarda la imagen nueva, elimina la anterior (si aplica) y guarda el registro en la BD
exports.guardarImagenPerfil = async (req, res, next) => {
  const usuario = await Usuarios.findByPk(req.user.id);
  //Si hay imagen anteior, eliminarla
  if (req.file && usuario.imagen) {
    const imagenAnteriorPath = path.join(
      __dirname,
      "../public/uploads/perfiles",
      usuario.imagen
    );
    // console.log("imagenAnteriorPath", imagenAnteriorPath);
    //Eliminar archivo con filesystem
    fs.unlink(imagenAnteriorPath, (error) => {
      if (error) {
        console.log("error", error);
      }
      return;
    });
  }
  //Almacena la nueva imagen
  if (req.file) {
    usuario.imagen = req.file.filename;
  }
  //Almacena en la base de datos y redireccionar
  await usuario.save();
  req.flash("exito", "Cambios Almacenados Correctamente");
  res.redirect("/administracion");
};
