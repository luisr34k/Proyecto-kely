const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const inputsController = require('../controllers/inputsController')

//router para las vistas principales
router.get('/' ,  authController.isAuthenticated, (req, res) => {
    res.render('layout', {body: req.body, user:req.user})//vista principal
})

router.get('/home' , (req, res) => {
    res.render('home', { login: false })
})

router.get('/login', (req, res) => {
    res.render('login', { alert: false, layout: false });
});

router.get('/register' , (req, res) => {
    res.render('register', {alert:false, layout:false});
})
//router para las vistas secundarias
router.get('/ventas' , (req, res) => {
    res.render('vistas/ventas')
})

router.get('/articulos' , (req, res) => {
    res.render('vistas/articulos')
})


router.get('/userProfile' , (req, res) => {
    res.render('vistas/userProfile')
})

router.get('/contado' , (req, res) => {
    res.render('vistas/contado')
})

router.get('/credito' , (req, res) => {
    res.render('vistas/credito')
})

router.get('/notificaciones', (rez, res ) => {
    res.render('vistas/notificaciones')
})

router.get('/pagos', (req, res) => {
    res.render('vistas/pagos')
})

router.get('/reportes', (req, res) => {
    res.render('vistas/reportes')
})

router.get('/reporteVentas', (req, res) => {
    res.render('vistas/reporteVentas')
})


//router para envio a la db

router.post('/guardarVenta', inputsController.guardarVenta);
router.post('/guardarVentaCredito', inputsController.guardarVentaCredito);
router.post('/guardarArticulo', inputsController.guardarArticulo);
router.get('/reporteArticulos', inputsController.obtenerReporteArticulos);
router.get('/buscarArticulos', inputsController.buscarArticulos);

//router para los metodos del controlador
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

// Agregar ruta GET para manejar las solicitudes de búsqueda



module.exports = router