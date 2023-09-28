const Meeti = require("../../models/Meeti");
const Grupos = require("../../models/Grupos");
const Usuarios = require("../../models/Usuarios");
const Categorias = require("../../models/Categorias");
const Comentarios = require("../../models/Comentarios");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");

exports.mostrarMeeti = async (req, res) => {
  const meeti = await Meeti.findOne({
    where: { slug: req.params.slug },
    include: [
      { model: Grupos },
      { model: Usuarios, attibutes: ["id", "nombre", "imagen"] },
    ],
  });
  //Si no existe
  if (!meeti) res.redirect("/");

  //Consultar por meeti's cercanos
  const ubicacion = Sequelize.literal(
    `ST_GeomFromText('POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})')`
  );

  //ST_Distance_Sphere = Retorna una linea en metros
  const distancia = Sequelize.fn(
    "ST_DistanceSphere",
    Sequelize.col("ubicacion"),
    ubicacion
  );
  //Encontrar meeti's cercanos
  const cercanos = await Meeti.findAll({
    order: distancia, //los ordena del mas cercano a lejano
    where: Sequelize.where(distancia, { [Op.lte]: 2000 }), //2mil metros o 2Kms
    limit: 3, //maximo 3
    offset: 1,
    include: [
      { model: Grupos },
      { model: Usuarios, attibutes: ["id", "nombre", "imagen"] },
    ],
  });
  //Consultar después de verificar que existe el meeti
  const comentarios = await Comentarios.findAll({
    where: { meetiId: meeti.id },
    include: [{ model: Usuarios, attibutes: ["id", "nombre", "imagen"] }],
  });
  // const grupo = await Grupos.findOne({ where: { slug: req.params.slug } });
  // const usuarioi = await Usuarios.findOne({ where: { slug: req.params.slug } });
  //Pasar el resultado hacia la vista
  res.render("mostrar-meeti", {
    nombrePagina: meeti.titulo,
    meeti,
    moment,
    comentarios,
    cercanos,
  });
};

exports.confirmarAsistencia = async (req, res) => {
  // console.log("hola");
  // res.send("Confirmando");
  console.log("req.body", req.body);
  const { accion } = req.body;

  if (accion === "confirmar") {
    //Agregar el usuario
    Meeti.update(
      {
        interesados: Sequelize.fn(
          "array_append",
          Sequelize.col("interesados"),
          req.user.id
        ),
      },
      { where: { slug: req.params.slug } }
    );
    //Mensaje confirmación
    res.send("Has confirmado tu asistencia");
  } else {
    //Cancelar el usuario
    Meeti.update(
      {
        interesados: Sequelize.fn(
          "array_remove",
          Sequelize.col("interesados"),
          req.user.id
        ),
      },
      { where: { slug: req.params.slug } }
    );
    // mensaje
    res.send("Has Cancelado tu asistencia");
  }
};
//Muesta el listado de asistentes
exports.mostrarAsistentes = async (req, res) => {
  const meeti = await Meeti.findOne({
    where: { slug: req.params.slug },
    attibutes: ["interesados"],
  });
  //Extraer interesados
  const { interesados } = meeti;
  const asistentes = await Usuarios.findAll({
    attibutes: ["nombre", "imagen"],
    where: { id: interesados },
  });
  // console.log("asistentes", asistentes);
  // console.log("meeti", meeti);
  //Crear la vista y pasar los asistentes
  res.render("asistentes-meeti", {
    nombrePagina: "Listado Asistentes Meeti",
    asistentes,
  });
};

exports.mostrarCategoria = async (req, res, next) => {
  const categoria = await Categorias.findOne({
    attibutes: ["id", "nombre"],
    where: { slug: req.params.categoria },
  });
  // console.log("categoria.id", categoria.id);
  const meetis = await Meeti.findAll({
    order: [
      ["fecha", "ASC"],
      ["hora", "ASC"],
    ],
    include: [
      { model: Grupos, where: { categoriaId: categoria.id } },
      { model: Usuarios },
    ],
  });
  // console.log("Meetis", Meetis);
  res.render("categoria", {
    nombrePagina: `Categoria: ${categoria.nombre}`,
    meetis,
    moment,
  });
};
