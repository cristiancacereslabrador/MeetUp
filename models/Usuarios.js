// const Sequelize = require("sequelize");
// const db = require("../config/db");
// const bcrypt = require("bcrypt-nodejs");

// const Usuarios = db.define(
//   "usuarios",
//   {
//     id: {
//       type: Sequelize.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     nombre: Sequelize.STRING(100),
//     imagen: Sequelize.STRING(100),
//     email: {
//       type: Sequelize.STRING(100),
//       allowNull: false,
//       validate: {
//         isEmail: { msg: "Agrega un correo válido" },
//       },
//       unique: {
//         args: true,
//         msg: "Usuario ya registrado",
//       },
//     },
//     password: {
//       type: Sequelize.STRING(100),
//       allowNull: false,
//       validate: {
//         notEmpty: { msg: "El password no puede ir vacío" },
//       },
//     },
//     activo: {
//       type: Sequelize.INTEGER,
//       defaultValue: 0,
//     },
//     tokenPassword: Sequelize.STRING,
//     expiraToken: Sequelize.DATE,
//   },
//   {
//     hooks: {
//       beforeCreate(usuario) {
//         usuario.password = bcrypt.hashSync(
//           usuario.password,
//           bcrypt.genSaltSync(10),
//           null
//         );
//       },
//     },
//   }
// );
// //Método para comparar los passwords
// Usuarios.prototype.validarPassword = function (password) {
//   return bcrypt.compareSync(password, this.password);
// };

// module.exports = Usuarios;

const Sequelize = require("sequelize");
const db = require("../config/db");
const bcrypt = require("bcrypt-nodejs");

const Usuarios = db.define(
  "usuarios",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: Sequelize.STRING(60),
    imagen: Sequelize.STRING(60),
    descripcion: Sequelize.TEXT,
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Agrega un correo válido" },
        // isUnique: {
        //   function(value, next) {
        //     var self = this;
        //     Usuarios.findOne({ where: { email: value } })
        //       .then(function (usuario) {
        //         if (usuario && self.id !== usuario.id) {
        //           return next("El email ya fue registrado!!!");
        //         }
        //         return next();
        //       })
        //       .catch(function (err) {
        //         return next(err);
        //       });
        //   },
        // },
      },
    },
    password: {
      type: Sequelize.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El password no puede ir vacío",
        },
      },
    },
    activo: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    tokenPassword: Sequelize.STRING,
    expiraToken: Sequelize.DATE,
  },
  {
    hooks: {
      beforeCreate(usuario) {
        usuario.password = Usuarios.prototype.hashPassword(usuario.password);
      },
    },
  }
);

// Método para comparar los password
Usuarios.prototype.validarPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
Usuarios.prototype.hashPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

module.exports = Usuarios;
