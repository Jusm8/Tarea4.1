const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://migacota:5xh1SV0oLFj0kEt2@cluster0.o32lg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const express = require("express")

const app = express();

//Configuracion de Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

const port = process.env.PORT || 8081;
let db, concesionariosCollection;

// Conectar a la base de datos
async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db("ConcesionariosDB");
    concesionariosCollection = db.collection("concesionarios");
    console.log("Conexión exitosa a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1);  // Detener la aplicación si no se puede conectar
  }
}

connectToDatabase();

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Ocurrió un error inesperado en el servidor" });
});

// Obtener todos los concesionarios
app.get("/concesionarios", async (req, res) => {
  try {
    const concesionarios = await concesionariosCollection.find().toArray();
    res.json(concesionarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener concesionarios" });
  }
});

// Crear un nuevo concesionario con validación
app.post("/concesionarios", async (req, res) => {
  try {
    const nuevoConcesionario = req.body;
    console.log("Cuerpo recibido:", nuevoConcesionario);

    if (!nuevoConcesionario.nombre || !nuevoConcesionario.direccion) {
      return res.status(400).json({ error: "Faltan datos esenciales" });
    }

    if (!concesionariosCollection) {
      return res.status(500).json({ error: "Colección no disponible para la inserción" });
    }

    const resultado = await concesionariosCollection.insertOne(nuevoConcesionario);

    if (resultado.insertedId) {
      res.json({ message: "Concesionario creado con éxito" });
    } else {
      res.status(500).json({ error: "No se pudo insertar el concesionario en la base de datos" });
    }
  } catch (error) {
    console.error("Error al crear concesionario:", error);
    res.status(500).json({ error: "Error al crear concesionario", details: error.message });
  }
});

// Arrancar el servidor
app.listen(port, () => {
  console.log(`Servidor desplegado en puerto: ${port}`);
});

// Obtener un concesionario por id con validación
app.get("/concesionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }
    const concesionario = await concesionariosCollection.findOne({ _id: new ObjectId(id) });
    if (!concesionario) return res.status(404).json({ error: "Concesionario no encontrado" });
    res.json(concesionario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener concesionario" });
  }
});

// Actualizar un concesionario por id con validación
app.put("/concesionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const datosActualizados = req.body;
    const resultado = await concesionariosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: datosActualizados }
    );

    if (resultado.matchedCount > 0) {
      res.json({ message: "Concesionario actualizado con éxito" });
    } else {
      res.status(404).json({ error: "Concesionario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar concesionario" });
  }
});

// Borrar un concesionario por id con validación
app.delete("/concesionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const resultado = await concesionariosCollection.deleteOne({ _id: new ObjectId(id) });
    if (resultado.deletedCount > 0) {
      res.json({ message: "Concesionario eliminado con éxito" });
    } else {
      res.status(404).json({ error: "Concesionario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar concesionario" });
  }
});

// Obtener todos los coches de un concesionario
app.get("/concesionarios/:id/coches", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }
    const concesionario = await concesionariosCollection.findOne({ _id: new ObjectId(id) }, { projection : { coches: 1 } } );
    if (!concesionario) return res.status(404).json({ error: "Concesionario no encontrado" });
    res.json(concesionario.coches);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener concesionario" });
  }
});

// Agregar un nuevo coche a un concesionario
app.post("/concesionarios/:id/coches", async (req, res) => {
  try {
    const { id } = req.params;
    const concesionario = await concesionariosCollection.findOne({ _id: new ObjectId(id) });
    if (!concesionario) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const nuevoCoche = req.body;
    const resultado = await concesionariosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { coches: nuevoCoche } }
    );

    if (resultado.matchedCount > 0) {
      res.json({ message: "Coche agregado con éxito" });
    } else {
      res.status(404).json({ error: "Concesionario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al agregar coche" });
  }
});
// Obtener un coche de un concesionario
app.get("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const { id, cocheId } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de concesionario no válido" });
    }

    const concesionario = await concesionariosCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { coches: 1 } }
    );

    if (!concesionario) return res.status(404).json({ error: "Concesionario no encontrado" });

    const coche = concesionario.coches.find((c, index) => index.toString() === cocheId);

    if (!coche) return res.status(404).json({ error: "Coche no encontrado" });

    res.json(coche);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el coche" });
  }
});

// Actualizar un coche de un concesionario
app.put("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const { id, cocheId } = req.params;
    const datosActualizados = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de concesionario no válido" });
    }

    const concesionario = await concesionariosCollection.findOne({ _id: new ObjectId(id) });

    if (!concesionario) return res.status(404).json({ error: "Concesionario no encontrado" });

    if (cocheId >= concesionario.coches.length) {
      return res.status(404).json({ error: "Coche no encontrado" });
    }

    concesionario.coches[cocheId] = { ...concesionario.coches[cocheId], ...datosActualizados };

    const resultado = await concesionariosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { coches: concesionario.coches } }
    );

    if (resultado.modifiedCount > 0) {
      res.json({ message: "Coche actualizado con éxito" });
    } else {
      res.status(400).json({ error: "No se pudo actualizar el coche" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el coche" });
  }
});

// Borrar un coche de un concesionario
app.delete("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const { id, cocheId } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de concesionario no válido" });
    }

    const resultado = await concesionariosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $unset: { [`coches.${cocheId}`]: 1 } }
    );

    if (resultado.modifiedCount > 0) {
      // Limpiar el array eliminando el elemento vacío
      await concesionariosCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { coches: null } }
      );
      res.json({ message: "Coche eliminado con éxito" });
    } else {
      res.status(404).json({ error: "Concesionario o coche no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar coche" });
  }
});
