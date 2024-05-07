const conexion = require('../database/db')

exports.guardarVenta = async (req, res) => {
    try {
       
        const { nombre_cliente, telefono_cliente, direccion_cliente, dpi_cliente, nit_cliente, id_vendedor, fecha_venta, descuento, cantidad, precio, codigo_articulo, fecha_limite_pago } = req.body;

        
        await conexion.query('CALL RealizarVenta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,1)', [nombre_cliente, telefono_cliente, direccion_cliente, dpi_cliente, nit_cliente, id_vendedor, fecha_venta, 'contado', descuento, cantidad, precio, codigo_articulo, fecha_limite_pago]);

        
        res.redirect('/ventas');
    } catch (error) {
        console.error(error);
        
        res.status(500).json({ mensaje: 'Hubo un error al realizar la venta en la base de datos' });
    }
}

exports.guardarVentaCredito = async (req, res) => {
    try {
        const { nombre_cliente, telefono_cliente, direccion_cliente, dpi_cliente, nit_cliente, id_vendedor, fecha_venta, descuento, cantidad, precio, codigo_articulo, fecha_limite_pago, numero_pagos } = req.body;

        await conexion.query('CALL RealizarVenta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nombre_cliente, telefono_cliente, direccion_cliente, dpi_cliente, nit_cliente, id_vendedor, fecha_venta, 'cuotas', descuento, cantidad, precio, codigo_articulo, fecha_limite_pago, numero_pagos]);

        res.redirect('/ventas');
    } catch (error) {
        console.error(error);
        
        res.status(500).json({ mensaje: 'Hubo un error al realizar la venta a crédito en la base de datos' });
    }
}


exports.guardarArticulo = async (req, res) => {
    try {
        // Extrae los datos del cuerpo de la solicitud
        const { codigo, nombre, precio_costo, precio_venta, precio_sugerido, ubicacion_id, descripcion, categoria, subcategoria, color, talla, marca, stock } = req.body;

        // Llama al procedimiento almacenado para guardar el artículo
        await conexion.query('INSERT INTO Articulos (codigo, nombre, precio_costo, precio_venta, precio_sugerido, ubicacion_id, descripcion, categoria, subcategoria, color, talla, marca, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [codigo, nombre, precio_costo, precio_venta, precio_sugerido, ubicacion_id, descripcion, categoria, subcategoria, color, talla, marca, stock]);

        // Redirige a la página principal u otra página según sea necesario
        res.redirect('/articulos');
    } catch (error) {
        console.error(error);
        // Maneja cualquier error que ocurra durante el proceso de guardar el artículo
        res.status(500).json({ mensaje: 'Hubo un error al guardar el artículo en la base de datos' });
    }
}

//REPORTES

exports.obtenerReporteArticulos = (req, res) => {
    const busqueda = req.query.busqueda || ''; // Obtén el valor de búsqueda del parámetro de consulta

    // Paginación
    const pagina = parseInt(req.query.pagina) || 1; // Número de página actual
    const filasPorPagina = 5; // Número de filas por página

    // Calcular el índice de inicio de la fila
    const inicio = (pagina - 1) * filasPorPagina;

    // Modifica la consulta SQL para incluir la búsqueda y la paginación
    const query = `
        SELECT SQL_CALC_FOUND_ROWS a.codigo, a.nombre, a.precio_costo, a.precio_venta, a.precio_sugerido, u.nombre as ubicacion, a.descripcion, a.categoria, a.subcategoria, a.color, a.talla, a.marca, a.stock
        FROM Articulos a
        INNER JOIN Ubicacion u ON a.ubicacion_id = u.id
        WHERE a.nombre LIKE ?
        LIMIT ?, ?`;

    conexion.query(query, [`%${busqueda}%`, inicio, filasPorPagina], (error, resultados) => {
        if (error) {
            console.error("Error al obtener el reporte de artículos:", error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }

        // Obtener el número total de filas (sin la limitación de la cláusula LIMIT)
        conexion.query('SELECT FOUND_ROWS() as totalFilas', (error, filas) => {
            if (error) {
                console.error("Error al obtener el número total de filas:", error);
                return res.status(500).json({ error: "Error interno del servidor" });
            }

            const totalFilas = filas[0].totalFilas;
            const totalPages = Math.ceil(totalFilas / filasPorPagina);

            // Renderizar la vista 'reporteArticulos' con los datos obtenidos
            res.render('vistas/reporteArticulos', { resultados, busqueda, pagina, totalPages });
        });
    });
};



exports.buscarArticulos = async (req, res) => {
    try {
        const termino = req.query.termino.toLowerCase();
        
        // Realizar la consulta a la base de datos para buscar artículos
        const resultados = await conexion.query('SELECT * FROM articulos WHERE nombre LIKE ?', [`%${termino}%`]);

        // Extraer los datos relevantes de los resultados de la consulta
        const articulos = resultados.map(resultado => ({
            codigo: resultado.codigo,
            nombre: resultado.nombre,
            precio: resultado.precio
            // Agrega aquí cualquier otro campo que desees incluir en la respuesta JSON
        }));

        // Enviar los datos de los artículos como respuesta JSON al cliente
        res.json(articulos);
    } catch (error) {
        console.error('Error al buscar artículos:', error);
        res.status(500).json({ mensaje: 'Hubo un error al buscar artículos en la base de datos' });
    }
}



