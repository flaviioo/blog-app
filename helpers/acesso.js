const eAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user?.eAdmin === 1) {
        return next();
    }
    req.flash("error_msg", "Acesso negado! Apenas administradores podem acessar esta página.");
    res.redirect("/");
};

const estaLogado = (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
        return next();
    }
    req.flash("error_msg", "Você precisa estar logado para acessar esta página.");
    res.redirect("/usuarios/login");
};

export default {
    eAdmin, 
    estaLogado
};
