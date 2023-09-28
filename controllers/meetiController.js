const Grupos = require("../models/Grupos");
const Meeti = require("../models/Meeti");

const uuid = require("uuid/v4");
//Muestra el formulario para nuevos Meeti
exports.formNuevoMeeti = async (req, res, next) => {
  const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id } });

  res.render("nuevo-meeti", { nombrePagina: "Crear Nuevo Meeti", grupos });
};
//Inserta nuevos Meeti en la Base de Datos
exports.crearMeti = async (req, res, next) => {
  //obtener los datos
  const meeti = req.body;
  console.log("meeti", meeti);
  //Asignar el usuario
  meeti.usuarioId = req.user.id;
  ////////////////////////////////////////////////
  meeti.id = uuid();
  ////////////////////////////////////////////////
  //Almacena la ubicación con un point
  const point = {
    type: "Point",
    coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)],
  };
  meeti.ubicacion = point;
  //Cupo opcional
  if (req.body.cupo === "") {
    meeti.cupo = 0;
  }
  //Almacenar en la BD
  try {
    await Meeti.create(meeti);
    req.flash("exito", "Se he creado el Metti Correctamente");
    res.redirect("/administracion");
  } catch (error) {
    const erroresSequelize = error.errors.map((err) => err.message);
    console.log("error", error);
    req.flash("error", erroresSequelize);
    res.redirect("/nuevo-meeti");
  }
};

//Sanitiza los meeti
exports.sanitizarMeeti = async (req, res, next) => {
  req.sanitizeBody("titulo");
  req.sanitizeBody("incitado");
  req.sanitizeBody("cupo");
  req.sanitizeBody("fecha");
  req.sanitizeBody("hora");
  req.sanitizeBody("direccion");
  req.sanitizeBody("estado");
  req.sanitizeBody("pais");
  req.sanitizeBody("lat");
  req.sanitizeBody("lng");
  req.sanitizeBody("");

  next();
};
//Muestra el formulario para editar un meeti
exports.formEditarMeeti = async (req, res, next) => {
  const consultas = [];
  consultas.push(Grupos.findAll({ where: { usuarioId: req.user.id } }));
  consultas.push(Meeti.findByPk(req.params.id));
  //Return a promise
  const [grupos, meeti] = await Promise.all(consultas);
  if (!grupos || !meeti) {
    req.flash("error", "Operación no válida");
    res.redirect("/administracion");
    return next();
  }
  //Mostramos la vista
  res.render("editar-meeti", {
    nombrePagina: `Editar Meeti: ${meeti.titulo}`,
    grupos,
    meeti,
  });
};
//Almacena los cambios en elmmeti BD
exports.editarMeeti = async (req, res, next) => {
  const meeti = await Meeti.findOne({
    where: { id: req.params.id, usuarioId: req.user.id },
  });
  if (!meeti) {
    req.flash("error", "Operación no válida");
    res.redirect("/administracion");
    return next();
  }
  //Asignar los valores
  // console.log("req.body", req.body);
  // return;
  const {
    grupoId,
    titulo,
    invitado,
    fecha,
    hora,
    cupo,
    descripcion,
    direccion,
    ciudad,
    estado,
    pais,
    lat,
    lng,
  } = req.body;
  // meeti = req.body;
  meeti.grupoId = grupoId;
  meeti.titulo = titulo;
  meeti.invitado = invitado;
  meeti.fecha = fecha;
  meeti.hora = hora;
  meeti.cupo = cupo;
  meeti.descripcion = descripcion;
  meeti.direccion = direccion;
  meeti.ciudad = ciudad;
  meeti.estado = estado;
  meeti.pais = pais;

  //Asignar point (unicación)
  const point = {
    type: "Point",
    coordinates: [parseFloat(lat), parseFloat(lng)],
  };
  meeti.ubicacion = point;
  //Almacenar en la BD
  await meeti.save();
  req.flash("exito", "Cambios guardados correctamente!");
  res.redirect("/administracion");
};

////////////////MINE/////////////////////////
//Muestra el formulario para eliminar un meeti
exports.formEliminarMeeti = async (req, res, next) => {
  const meeti = await Meeti.findOne({
    where: { id: req.params.id, usuarioId: req.user.id },
  });
  // console.log("meeti conseguido?", meeti);
  if (!meeti) {
    req.flash("error", "Operación no válida");
    res.redirect("/administracion");
    return next();
  }
  //To do bien, ejecutar la vista
  res.render("eliminar-meeti", {
    nombrePagina: `Eliminar Meeti: ${meeti.titulo}`,
  });
};
//Eliminar meeti de la DB
exports.eliminarMeeti = async (req, res, next) => {
  await Meeti.findOne({
    where: { id: req.params.id },
  });
  // if (!meeti) {
  //   req.flash("error", "Operación no válida");
  //   res.redirect("/administracion");
  //   return next();
  // }
  //Eliminar el grupo
  await Meeti.destroy({ where: { id: req.params.id } });
  //Redireccionar al usuario
  req.flash("exito", "Meeti Eliminado");
  res.redirect("/administracion");
};
////////////////MINE/////////////////////////
