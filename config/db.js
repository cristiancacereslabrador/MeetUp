const Sequelize = require("sequelize");
//PARA ACTUALIZAR CUALQUIER CAMBIO EN LA ESTRUCTURA DE LA DB
//sequelize db:migrate

module.exports = new Sequelize("postgres", "postgres", "vianey", {
  host: "127.0.0.1" || "localhost",
  port: "5433",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // define: {
  //   timestamps: false,
  // },//ELIMINAR LAS COLUMNAS DE CREACION Y ACUALIZACION DE CADA REGISTRO
  logging: false, // DESACTIVAR LA INFO DE LA CONEXION A LA DB
});
