/**
 * Modelo de datos actualizado para una API RESTful.
 * Un concesionario contiene nombre, dirección y una lista de coches.
 * Cada coche tiene modelo, cv (potencia) y precio.
 */

const express = require("express");
const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;

// Modelo de datos actualizado
let concesionarios = [
  {
    nombre: "Concesionario Central",
    direccion: "Calle Mayor, 123",
    coches: [
      { modelo: "Opel Corsa", cv: 75, precio: 15000 },
      { modelo: "Renault Megane", cv: 110, precio: 20000 },
    ],
  },
];

// Endpoints de la API

// Obtener todos los concesionarios
app.get("/concesionarios", (req, res) => {
  res.json(concesionarios);
});

// Crear un nuevo concesionario
app.post("/concesionarios", (req, res) => {
  concesionarios.push(req.body);
  res.json({ message: "Concesionario creado con éxito" });
});

// Obtener un concesionario por id
app.get("/concesionarios/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < concesionarios.length) {
    res.json(concesionarios[id]);
  } else {
    res.status(404).json({ error: "Concesionario no encontrado" });
  }
});

// Actualizar un concesionario por id
app.put("/concesionarios/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < concesionarios.length) {
    concesionarios[id] = req.body;
    res.json({ message: "Concesionario actualizado" });
  } else {
    res.status(404).json({ error: "Concesionario no encontrado" });
  }
});

// Borrar un concesionario por id
app.delete("/concesionarios/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < concesionarios.length) {
    concesionarios.splice(id, 1);
    res.json({ message: "Concesionario eliminado" });
  } else {
    res.status(404).json({ error: "Concesionario no encontrado" });
  }
});

// Obtener todos los coches de un concesionario
app.get("/concesionarios/:id/coches", (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < concesionarios.length) {
    res.json(concesionarios[id].coches);
  } else {
    res.status(404).json({ error: "Concesionario no encontrado" });
  }
});

// Agregar un nuevo coche a un concesionario
app.post("/concesionarios/:id/coches", (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < concesionarios.length) {
    concesionarios[id].coches.push(req.body);
    res.json({ message: "Coche agregado con éxito" });
  } else {
    res.status(404).json({ error: "Concesionario no encontrado" });
  }
});

// Obtener un coche por id dentro de un concesionario
app.get("/concesionarios/:id/coches/:cocheId", (req, res) => {
  const id = parseInt(req.params.id);
  const cocheId = parseInt(req.params.cocheId);
  if (id >= 0 && id < concesionarios.length && cocheId >= 0 && cocheId < concesionarios[id].coches.length) {
    res.json(concesionarios[id].coches[cocheId]);
  } else {
    res.status(404).json({ error: "Coche o concesionario no encontrado" });
  }
});

// Actualizar un coche por id dentro de un concesionario
app.put("/concesionarios/:id/coches/:cocheId", (req, res) => {
  const id = parseInt(req.params.id);
  const cocheId = parseInt(req.params.cocheId);
  if (id >= 0 && id < concesionarios.length && cocheId >= 0 && cocheId < concesionarios[id].coches.length) {
    concesionarios[id].coches[cocheId] = req.body;
    res.json({ message: "Coche actualizado con éxito" });
  } else {
    res.status(404).json({ error: "Coche o concesionario no encontrado" });
  }
});

// Borrar un coche por id dentro de un concesionario
app.delete("/concesionarios/:id/coches/:cocheId", (req, res) => {
  const id = parseInt(req.params.id);
  const cocheId = parseInt(req.params.cocheId);
  if (id >= 0 && id < concesionarios.length && cocheId >= 0 && cocheId < concesionarios[id].coches.length) {
    concesionarios[id].coches.splice(cocheId, 1);
    res.json({ message: "Coche eliminado con éxito" });
  } else {
    res.status(404).json({ error: "Coche o concesionario no encontrado" });
  }
});

// Arrancar el servidor
app.listen(port, () => {
  console.log(`Servidor desplegado en puerto: ${port}`);
});
