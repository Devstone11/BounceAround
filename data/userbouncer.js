module.exports = function(req, res, next) {
  if (req.cookies.id) {
    next();
  } else {
    console.log("not authorized");
    res.redirect('/');
  }
};
