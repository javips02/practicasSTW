var express = require('express');
var router = express.Router();

// Para la validación del JSON Schema
const Ajv = require('ajv');
const ajv = new Ajv(); // Opciones por defecto
// https://swagger.io/docs/specification/v3_0/media-types/
// https://swagger.io/docs/specification/v3_0/data-models/data-types/#numbers 

/**
 * @swagger
 * components:
 *   schemas:
 *     Estudiante:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del estudiante.
 *           example: Juan
 *         apellidos:
 *           type: string
 *           description: Apellidos del estudiante.
 *           example: Pérez López
 *         nip:
 *           type: number
 *           description: Número de identificación personal del estudiante.
 *           example: 123456
 *         email:
 *           type: string
 *           description: La dirección de correo electrónico del estudiante
 *           example: 123456@unizar.es
 *         asignaturas:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *             calificacion:
 *               type: number
 *               format: double
 *       required:
 *         - nombre
 *         - apellidos
 *         - nip
 *         - email
 *       additionalProperties: false
 */
 const schemaEstudiante = {
  type: "object",
  properties: {
    nombre: { type: "string" },
    apellidos: { type: "string" },
    nip: { type: "number" },
    email: { type: "string" },
    asignaturas: {
      nombre: { type: "string"},
      calificacion: { type: Number}
    },
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

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Devuelve una lista de estudiantes
 *     responses:
 *       200:
 *         description: Una lista de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     description: Nombre del estudiante.
 *                   apellidos:
 *                     type: string
 *                     description: Apellidos del estudiante.
 *                   nip:
 *                     type: number
 *                     description: NIP del estudiante.
 *                   email:
 *                     type: string
 *                     description: Email del estudiante.
 */
router.get('/', function(req, res, next) {
  res.send(JSON.stringify(data));
});

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Añade un nuevo estudiante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Estudiante'
 *     responses:
 *       201:
 *         description: Estudiante creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *       400:
 *         description: Error en la solicitud
 */router.post('/', function(req, res, next) {
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

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Obtiene un estudiante por su ID
 *     description: Devuelve el estudiante correspondiente al ID proporcionado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del estudiante a buscar.
 *     responses:
 *       200:
 *         description: Estudiante encontrado con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estudiante'
 *       404:
 *         description: Estudiante no encontrado.
 */
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

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Elimina un estudiante por su ID
 *     description: Elimina el estudiante correspondiente al ID proporcionado si existe.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del estudiante a eliminar.
 *     responses:
 *       204:
 *         description: Estudiante eliminado con éxito, sin contenido en la respuesta.
 *       404:
 *         description: Estudiante no encontrado.
 */
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

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Actualiza un estudiante por su ID
 *     description: Actualiza los datos del estudiante correspondiente al ID proporcionado con la información suministrada en el cuerpo de la solicitud. Se debe proporcionar al menos uno de los campos 'nombre', 'apellidos', 'nip', o 'email'.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del estudiante a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Pepito
 *               apellidos:
 *                 type: string
 *                 example: López
 *               nip:
 *                 type: number
 *                 example: 422316
 *               email:
 *                 type: string
 *                 example: 422316@unizar.es
 *             minProperties: 1
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Estudiante actualizado con éxito.
 *       400:
 *         description: El cuerpo de la solicitud no contiene ninguna propiedad válida para actualizar.
 *       404:
 *         description: Estudiante no encontrado.
 */
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