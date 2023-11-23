const express = require("express");
const Venta = require("../models/ventas");

const router = express.Router();

// Crear una nueva venta
router.post("/ventas", (req, res) => {
    const nuevaVenta = new Venta(req.body);

    nuevaVenta
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.status(400).json({ message: error }));
});

// Obtener todas las ventas
router.get("/ventas", (req, res) => {
    Venta.find()
        .then((ventas) => res.json(ventas))
        .catch((error) => res.status(500).json({ message: error }));
});

// Obtener una venta por ID
router.get("/ventas/:id", (req, res) => {
    const { id } = req.params;
    Venta.findById(id)
        .then((venta) => {
            if (!venta) {
                return res.status(404).json({ message: "Venta no encontrada" });
            }
            res.json(venta);
        })
        .catch((error) => res.status(500).json({ message: error }));
});

// Actualizar una venta por ID
router.put("/ventas/:id", (req, res) => {
    const { id } = req.params;
    Venta.findByIdAndUpdate(id, req.body, { new: true })
        .then((venta) => {
            if (!venta) {
                return res.status(404).json({ message: "Venta no encontrada" });
            }
            res.json(venta);
        })
        .catch((error) => res.status(500).json({ message: error }));
});

// Eliminar una venta por ID
router.delete("/ventas/:id", (req, res) => {
    const { id } = req.params;
    Venta.findOneAndDelete({ _id: id })
        .then((venta) => {
            if (!venta) {
                return res.status(404).json({ message: "Venta no encontrada" });
            }
            res.json({ message: "Venta eliminada exitosamente" });
        })
        .catch((error) => res.status(500).json({ message: error.message }));
});


module.exports = router;
