const Categorias = require("../models/Categorias");
const Grupos = require("../models/Grupos");

const path = require("path");
const fs = require("fs");

const multer = require("multer");
const shortid = require("shortid");

const uuid = require("uuid/v4");

const configuracionMulter = {
  limits: { fileSize: 500000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, res, next) => {
      next(null, __dirname + "/../public/uploads/grupos/");
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

exports.formNuevoGrupo = async (req, res) => {
  // // const categorias = await Categorias.findAll();

  // // res.render("nuevo-grupo", {
  // //   nombrePagina: "Crea un nuevo grupo",
  // //   categorias,
  // // });
  try {
    const categorias = await Categorias.findAll();
    console.log("Se cargaron las categorías con éxito."); // Agregar este mensaje

    res.render("nuevo-grupo", {
      nombrePagina: "Crea un nuevo grupo",
      categorias,
    });
  } catch (error) {
    console.error("Error al cargar las categorías:", error); // Agregar este mensaje de error
    // Manejo de errores
  }
};
//Almacena los grupos en la base de datos
exports.crearGrupo = async (req, res) => {
  //Sanitizar
  req.sanitizeBody("nombre");
  req.sanitizeBody("url");

  const grupo = req.body;
  // console.log("req.body", req.body);
  //Almacena el usuario autenticado como el creador del grupo
  grupo.usuarioId = req.user.id;
  // grupo.categoriaId = req.body.caterogia; //se hace de este modo  o en nuevo-grupo.ejs se cambia el name "categoria" a "categoriaId"
  //Leer la imagen
  if (req.file) {
    grupo.imagen = req.file.filename;
  }
  ///////////////////////////////////////////////////////
  grupo.id = uuid();
  ///////////////////////////////////////////////////////

  console.log("grupo:=>", grupo);
  try {
    //Almacenar en la BD
    await Grupos.create(grupo);
    req.flash("exito", "Se ha creado el Grupo correctamente!");
    res.redirect("/administracion");
  } catch (error) {
    //Extraer el mensaje de los errores
    // console.log("error", error);
    const erroresSequelize = error.errors.map((err) => err.message);
    console.log("erroresSequelize", erroresSequelize);
    // req.flash("error", error);
    req.flash("error", erroresSequelize);
    res.redirect("/nuevo-grupo");
  }
};

exports.formEditarGrupo = async (req, res) => {
  const consultas = [];
  consultas.push(Grupos.findByPk(req.params.grupoId));
  consultas.push(Categorias.findAll());
  const [grupo, categorias] = await Promise.all(consultas);
  // console.log("grupo de formEditarGrupo", grupo);
  res.render("editar-grupo", {
    nombrePagina: `Editar Grupo: ${grupo.nombre}`,
    grupo,
    categorias,
  });
};
//Guarda los campos eb la base de datos en la base de datos
exports.editarGrupo = async (req, res, next) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId },
    usuarioId: req.user.id,
  });
  // console.log("grupo", grupo);
  // return;
  //Si no no existe ee grupo o no es el dueño
  if (!grupo) {
    req.flash("error", "Operación no válida");
    res.redirect("/administracion");
    return next();
  }
  //To do bien, leer los valores
  // console.log("editarGrupo req.body", req.body);
  const { nombre, descripcion, categoriaId, url } = req.body;
  //Asignar los valores
  grupo.nombre = nombre;
  grupo.descripcion = descripcion;
  grupo.categoriaId = categoriaId;
  grupo.url = url;
  //Guardamos en la base de datos de la base de datos
  await grupo.save();
  req.flash("exito", "Cambios Almacenados Correctamente");
  res.redirect("/administracion");
};

//Muestra el formulario para editar una imagen de grupo
exports.formEditarImagen = async (req, res) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId },
    usuarioId: req.user.id,
  });
  // console.log("editarGrupo grupo", grupo);
  res.render("imagen-grupo", {
    nombrePagina: `Editar Imagen Grupo: ${grupo.nombre}`,
    grupo,
  });
};
//Modifica la imagen en la base de datos y elimina la anterior
exports.editarImagen = async (req, res, next) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId },
    usuarioId: req.user.id,
  });
  //El grupo existe y es válido
  if (!grupo) {
    req.flash("error", "Operación no válida");
    res.redirect("/iniciar-sesion");
    return next();
  }

  //Verificar que el archivo sea nuevo
  // if (req.file) {
  //   console.log("req.file.filename", req.file.filename);
  // }
  //Revisar que exista un archivo anterior
  // if (grupo.imagen) {
  //   console.log("grupo.imagen", grupo.imagen);
  // }
  //Si hay imagen anterior y nueva, significa que vamos a borrar la anterior
  if (req.file && grupo.imagen) {
    const imagenAnteriorPath = path.join(
      __dirname,
      "../public/uploads/grupos",
      grupo.imagen
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
  //Si hay una imagen nueva, la guardamos
  if (req.file) {
    grupo.imagen = req.file.filename;
  }
  //Guardar en la BD
  await grupo.save();
  req.flash("exito", "Cambios Almacenados Correctamente");
  res.redirect("/administracion");
};
//Muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId, usuarioId: req.user.id },
  });
  if (!grupo) {
    req.flash("error", "Operación no válida");
    res.redirect("/administracion");
    return next();
  }
  //To do bien, ejecutar la vista
  res.render("eliminar-grupo", {
    nombrePagina: `Eliminar grupo: ${grupo.nombre}`,
  });
};
//Eliminar grupo e imagen
exports.eliminarGrupo = async (req, res, next) => {
  const grupo = await Grupos.findOne({
    where: { id: req.params.grupoId, usuarioId: req.user.id },
  });
  // if (!grupo) {
  //   req.flash("error", "Operación no válida");
  //   res.redirect("/administracion");
  //   return next();
  // }
  console.log("eliminarGrupo grupo.imagen", grupo.imagen);
  if (grupo.imagen) {
    const imagenAnteriorPath = path.join(
      __dirname,
      "../public/uploads/grupos",
      grupo.imagen
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
  //Eliminar el grupo
  await Grupos.destroy({ where: { id: req.params.grupoId } });
  //Redireccionar al usuario
  req.flash("exito", "Grupo Eliminado");
  res.redirect("/administracion");
};
