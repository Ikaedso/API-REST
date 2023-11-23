const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Agregamos la librería CORS
require('dotenv').config();
const app = express();
const port = process.env.PORT || 9000;
const ventasRoutes = require("./routes/ventas");

// Middleware CORS para permitir solicitudes desde todos los orígenes
app.use(cors());

// Middleware
app.use(express.json());
app.use('/api', ventasRoutes);

// Ruta de inicio
app.get('/', (req, res) => {
    res.send('Welcome to my API');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected to MongoDB')).catch((error) => console.error(error));

// Iniciar servidor
app.listen(port, () => console.log('Server listening on port', port));
