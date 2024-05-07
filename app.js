const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');


const app = express();

//motor de plantillas
app.set('view engine', 'ejs')
app.use(expressLayouts)

// seteamos /public para archivos estaticos
app.use(express.static('public'))

//para procesar datos enviados desde forms
app.use(express.urlencoded({ extended:true }))
app.use(express.json())

//seteamos las variables de entorno
dotenv.config({ path: './env/.env'})

//para trabajar con las cukis
app.use(cookieParser())

//llamar al router
app.use('/', require('./routes/router'))

//eliminar cache y no se pueda volver con el boton de atras

app.use(function(req, res, next){
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});


app.listen(3000, () => {
    console.log('SERVER UP running in http://localhost:3000')
})