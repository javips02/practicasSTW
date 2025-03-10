var express = require('express');
var router = express.Router();

// Para la validación del JSON Schema
const Ajv = require('ajv');
const ajv = new Ajv(); // Opciones por defecto

// Define el esquema JSON para un estudiante
const schemaEstudiante = {
  type: "object",
  properties: {
    nombre: { type: "string" },
    apellidos: { type: "string" },
    nip: { type: "number" },
    email: { type: "string" },
  },
  required: ["nombre", "apellidos", "nip", "email"], // Propiedades requeridas
  additionalProperties: false // No permite propiedades adicionales
};

let data = {
  count: 0,
  estudiantes: []
};

// Función para generar un ID aleatorio
function generarId() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

/* GET Obtener el listado de estudiantes. */
router.get('/', function(req, res, next) {
  res.send(JSON.stringify(data));
});

/* POST añadir un nuevo estudiante. */
/* Le añadiremos un ID aleatorio y la fecha de creación/adición */
router.post('/', function(req, res, next) {
  console.log("Status: " + req.statusCode);
  console.log("Body: " + JSON.stringify(req.body));
  
  // Lo primero, realizamos la validación
  const validate = ajv.compile(schemaEstudiante);
  const valid = validate(req.body);

  if (!valid) {
    console.log(validate.errors);
    res.status(400).send({ errors: validate.errors });
    return;
  }

  const estudianteConId = { id: generarId(), ...req.body };
  estudianteConId.fecha_creacion = new Date().toISOString();

  data.estudiantes.push(estudianteConId);
  data.count = data.estudiantes.length;

  res.status(201).send(JSON.stringify(data));
});

/* GET Obtener los datos de un estudiante en concreto. */
router.get('/:id', function(req, res, next) {
  console.log("Status: " + req.statusCode);
  const idBuscado = req.params.id;
  console.log(`Recurso solicitado con ID: ${idBuscado}`);
  
  // Busca en el array el estudiante con el ID correspondiente
  const estudiante = data.estudiantes.find(estudiante => estudiante.id === idBuscado);

  if (estudiante) {
    res.json(estudiante); // Si el estudiante existe, envía el objeto estudiante como respuesta
  } else {
    res.status(404).send('Estudiante no encontrado'); // Si no se encuentra, envía un error 404
  }
});

/* DELETE Eliminar un estudiante. */
router.delete('/:id', function(req, res, next) {
  console.log("Status: " + req.statusCode);

  const idParaEliminar = req.params.id;
  console.log(`Recurso solicitado con ID: ${idParaEliminar}`);
  // Filtra el array para excluir el estudiante con el ID proporcionado
  const estudiantesFiltrados = data.estudiantes.filter(estudiante => estudiante.id !== idParaEliminar);

  if (data.estudiantes.length > estudiantesFiltrados.length) {
    data.estudiantes = estudiantesFiltrados; // Actualiza el array de estudiantes
    data.count = data.estudiantes.length;
    res.status(204).send();
  } else {
    // Si el tamaÃ±o del array no cambia, el estudiante no fue encontrado
    res.status(404).send('Estudiante no encontrado');
  }
});

/* PUT Actualiza los datos de un estudiante. */
router.put('/:id', (req, res) => {
  console.log("Status: " + req.statusCode);
  const idParaActualizar = req.params.id;
  console.log(`Recurso solicitado con ID: ${idParaActualizar}`);
  const { id, fecha_creacion, ...datosActualizados } = req.body; // Excluye 'id' y 'fecha_creacion' de los datos actualizados

  // Verifica si al menos una propiedad en datosActualizados está en el schema
  const tienePropiedadValida = Object.keys(datosActualizados).some(prop => schemaEstudiante.properties.hasOwnProperty(prop));

  if (!tienePropiedadValida) {
    return res.status(400).send('El cuerpo de la solicitud no contiene ninguna propiedad válida para actualizar.');
  }

  // Encuentra el índice del estudiante en el array
  const indice = data.estudiantes.findIndex(estudiante => estudiante.id === idParaActualizar);

  if (indice !== -1) {
    // Actualiza los datos del estudiante, conservando 'id' y 'fecha_creacion'
    data.estudiantes[indice] = { ...data.estudiantes[indice], ...datosActualizados };
    res.send('Estudiante actualizado con éxito');
  } else {
    res.status(404).send('Estudiante no encontrado');
  }
});

module.exports = router;