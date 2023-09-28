const Comentarios = require("../../models/Comentarios");
const Meeti = require("../../models/Meeti");

exports.agregarComentario = async (req, res, next) => {
  //Obtener el comentarios
  console.log("req.body Comentarios", req.body);

  const { comentario } = req.body;
  //Crear comentario en la BD
  await Comentarios.create({
    mensaje: comentario,
    usuarioId: req.user.id,
    meetiId: req.params.id,
  });
  //Redireccionar
  res.redirect("back");
  next();
};

//Elimina un comentario de la base de datos
exports.eliminarComentario = async (req, res, next) => {
  // res.send("Se elimino...");
  // console.log("req.body", req.body);
  // Tomar el ID del comentario
  const { comentarioId } = req.body;
  //Consultar el Comentario
  const comentario = await Comentarios.findOne({ where: { id: comentarioId } });
  // console.log("comentario", comentario);
  //Verificar si existe el comentario
  if (!comentario) {
    res.status(404).send("Accion no válida");
    next();
  }
  //Constular el Meeti del comentario
  const meeti = await Meeti.findOne({ where: { id: comentario.meetiId } });
  //Verificar que quien lo borra sea el creador
  if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
    // res.send("Si es la persona q creo el comentario");
    await Comentarios.destroy({ where: { id: comentario.id } });
    res.status(200).send("Eliminado Correctamente");
    return next();
  } else {
    res.status(403).send("Accion no válida");
    return next();
  }
};
