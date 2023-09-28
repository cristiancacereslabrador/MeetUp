const passport = require("passport");

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/administracion",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios",
});

//Revisa si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  //Si no esta autenticado
  return res.redirect("/iniciar-sesion");
};
//Cerrar Sesion
exports.cerrarSesion = (req, res, next) => {
  // req.logout(); //ORIGINAL

  req.logout(req.user, (err) => {
    if (err) return next(err);
    req.flash("exito", "Cerraste sesión correctamente");
    res.redirect("/iniciar-sesion");
  });

  // next();
};
