const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util');


// procedimiento para registrarnos
exports.register = async (req, res) => {
    try {
        const user = req.body.user;
        const pass = req.body.pass;
        const role = req.body.role;

        // Verificar si el usuario ya existe
        const existingUser = await promisify(conexion.query).call(conexion, 'SELECT * FROM usuarios WHERE nombre_usuario = ?', [user]);
        if (existingUser.length > 0) {
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El usuario ya existe",
                alertIcon: "error",
                showConfirmButton: true,
                timer: false,
                ruta: 'register',
                layout: false
            });
           
            
        }

        // Verificar si la contraseña tiene al menos 4 caracteres
        if (pass.length < 5) {
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "La contraseña debe tener al menos 5 caracteres",
                alertIcon: "error",
                showConfirmButton: true,
                timer: false,
                ruta: 'register',
                layout: false
            });
        }

        const passHash = await bcryptjs.hash(pass, 8);
        //inserta el usuario
        conexion.query('INSERT INTO usuarios SET ?', { nombre_usuario: user, contraseña: passHash, rol: role }, (e, results) => {
            if (e) {
                console.log(e);
                return res.status(500).send("Error en el servidor");
            }
            res.redirect('login');
        });

    } catch (e) {
        console.log(e);
        return res.status(500).send("Error en el servidor");
    }
}

// procedimiento para loguearnos
exports.login = async (req, res) => {

    try {
        const user = req.body.user
        const pass = req.body.pass
        
        if( !user || !pass ){
            res.render('login',{
                alert:true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese usuario y contraseña",
                alertIcon: "info",
                showConfirmButton: true,
                timer: false,
                ruta: 'login',
                layout: false
            })
        }else{
            conexion.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [user], async (error, results) => {
                if(results.length == 0 || ! ( await bcryptjs.compare(pass, results[0].contraseña))){
                    res.render('login',{
                        alert:true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o contraseña incorrectos",
                        alertIcon: "Error",
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login',
                        layout: false
                    })
                    
                }else{
                    //inicio de sesion OK!
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    //generamos el token sin fecha de expiracion
                    //const token = jwt.sign({id: id}, process.env.JWT_SECRETO)
                    //console.log("TOKEN: " + token + " para el usuario: " + user)

                    const cookiesOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookiesOptions)
                    res.render('login',{
                        alert:true,
                        alertTitle: "conexion exitosa",
                        alertMessage: "Login correcto",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 800,
                        ruta: 'home',
                        layout: false
                    })
                }
            })
        }

    } catch (e) {
        console.log(e)
    }

}

exports.isAuthenticated = async (req, res, next) => {
    if(req.cookies.jwt){
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM usuarios WHERE id = ?', [decodificada.id], (error, results) =>{
                if(!results){return next()}
                req.user = results[0]
                return next()
            })
        } catch (e) {
            console.log(e)
            return next()

        }
    }else{
        res.redirect('/login')
        
    }
}
//procedimiento para desloguearnos
exports.logout = (req, res)=>{
    res.clearCookie('jwt')
    return res.redirect('/')
}




