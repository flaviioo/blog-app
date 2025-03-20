const eAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user?.eAdmin === 1) {
        return next();
    }
    req.flash("error_msg", "Acesso negado! Apenas administradores podem acessar esta página.");
    res.redirect("/home");
};

const estaLogado = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error_msg", "Você precisa estar logado para acessar esta página.");
    res.redirect("/");
};

// Middleware para impedir usuários logados de acessarem login e registro
const redirecionaSeLogado = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash("info_msg", "Você já está logado.");
        return res.redirect("/home");
    }
    next();
};

export default {
    eAdmin, 
    estaLogado,
    redirecionaSeLogado
};
