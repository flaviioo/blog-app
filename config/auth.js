import { Strategy as LocalStrategy } from 'passport-local';
import { model } from 'mongoose';
import bcrypt from 'bcrypt';
import '../models/Usuarios.js';
const Usuario = model('usuarios');

export default function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'senha'
    }, (email, senha, done) => {
        Usuario.findOne({ email: email }).then(usuario => {
            if (!usuario) {
                return done(null, false, { message: 'Usuário não encontrado' });
            }

            bcrypt.compare(senha, usuario.senha, (err, isMatch) => {
                if (err) return done(err);
                if (isMatch) {
                    return done(null, usuario);
                } else {
                    return done(null, false, { message: 'Senha incorreta' });
                }
            });
        }).catch(err => done(err));
    }));

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    });

    passport.deserializeUser((id, done) => {
        Usuario.findById(id).then(usuario => {
            done(null, usuario);
        }).catch(err => done(err));
    });
}
