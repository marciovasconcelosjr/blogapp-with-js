module.exports = {
    ehAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.ehAdmin == 1){
            return next();
        }

        req.flash('error_msg', 'Você precisa ser um admin para acessar essa página')
        res.redirect('/')
    }
}