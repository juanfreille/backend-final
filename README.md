# E-commerce Marketplace

## Descripción

Este proyecto es una aplicación de comercio electrónico que utiliza **Node.js**, **Express**, **MongoDB**, y **Socket.io**. Ofrece funcionalidades para gestionar productos, carritos de compra, usuarios y chat en tiempo real. Además, el sistema está configurado con autenticación JWT y manejo de imágenes de perfil y productos.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución de JavaScript en el servidor.
- **Express**: Framework para aplicaciones web.
- **MongoDB**: Base de datos NoSQL.
- **Mongoose**: Librería de ODM para MongoDB.
- **Socket.io**: Biblioteca para comunicación en tiempo real.
- **Passport.js**: Middleware para autenticación.
- **Winston**: Librería para manejo de logs.
- **Handlebars**: Motor de plantillas para renderización de vistas.
- **Swagger**: Herramienta para documentación de API.
- **FileSystem (FS)**: Módulo de Node.js para la manipulación de archivos y directorios en el sistema de archivos.
- **Handlebars**: Motor de plantillas para la renderización de vistas en aplicaciones web, permite generar HTML dinámico a partir de datos.
- **JWT (JSON Web Tokens)**: Estándar abierto para la creación de tokens de acceso seguros y compactos en aplicaciones web.
- **Passport**: Middleware de autenticación en Node.js que proporciona una variedad de estrategias para manejar el inicio de sesión.
- **Faker**: Librería para generar datos ficticios como nombres, direcciones y números de teléfono, útil para pruebas y desarrollo.
- **Bcrypt**: Biblioteca para el hash de contraseñas y la gestión de la seguridad de las contraseñas en aplicaciones web.
- **Nodemailer**: Librería para enviar correos electrónicos desde una aplicación Node.js, que soporta diversos servicios de correo y configuraciones.

## Estructura de Directorios

A continuación se muestra la estructura de directorios del proyecto:

```
/Ecommerce
├── src/
│ ├── config/ # Configuraciones del proyecto (configuración de Passport, base de datos, etc.)
│ ├── controllers/ # Controladores que manejan la lógica de negocio para las rutas
│ ├── dao/ # Data Access Objects para interactuar con la base de datos
│ ├── docs/ # Documentación del proyecto (esquemas, especificaciones, etc.)
│ ├── dto/ # Data Transfer Objects para estructurar datos entre capas
│ ├── logs/ # Archivos de log generados por la aplicación
│ ├── middlewares/ # Middlewares personalizados para la aplicación
│ ├── models/ # Modelos de datos y esquemas de Mongoose
│ ├── routes/ # Definiciones de rutas de la aplicación
│ ├── services/ # Servicios que contienen la lógica de negocio
│ ├── test/ # Pruebas unitarias e integradas
│ ├── utils/ # Utilidades y funciones auxiliares
│ ├── views/ # Plantillas de vista para renderizar la interfaz de usuario
│ ├── app.js # Archivo principal de configuración y arranque de la aplicación
│ └── sockets.js # Configuración de WebSockets para la comunicación en tiempo real
├── public/
│ ├── css/ # Archivos CSS para el estilo de la interfaz de usuario
│ ├── documents/ # Documentos cargados por los usuarios
│ ├── img/ # Imágenes utilizadas en la aplicación (productos y avatars)
│ └── js/ # Archivos JavaScript para la funcionalidad del cliente
├── README.md # Documentación del proyecto
├── LICENSE # Archivo de licencia del proyecto
└── package.json # Dependencias y scripts del proyecto
```

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/juanfreille/backend-final.git
   ```

2. **Instala las dependencias:**

   Navega al directorio del proyecto y ejecuta:

   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:

   ```env
   PORT=
   MONGO_URL=
   MONGO_TEST_URL=
   SESSION_SECRET=
   CLIENT_ID=
   SECRET_ID=
   GITHUB_CALLBACK_URL=
   JWT_SECRET=
   ADMIN_EMAIL=
   ADMIN_PASSWORD=
   NODE_ENV=
   EMAIL_USER=
   EMAIL_PASSWORD=
   PERSISTENCE=
   ```

4. **Inicia la aplicación:**

   ```bash
   npm start
   ```

## Uso

- **Inicio**: Navega a `http://localhost:8080` para acceder a la aplicación.
- **Documentación API**: Accede a la documentación en `/api/docs`.
- **WebSocket**: El chat en tiempo real y las actualizaciones de productos utilizan WebSockets. La conexión se establece automáticamente al cargar la página.

## Rutas

### Vistas

- **Home**: `/`
- **Login**: `/login`
- **Register**: `/register`
- **Products**: `/products`
- **Real Time Products**: `/realtimeproducts`
- **Chat**: `/chat`
- **Cart**: `/cart/:cid`
- **Product Details**: `/products/item/:pid`
- **Purchase**: `/cart/:cid/purchase`
- **Profile**: `/profile`
- **Reset Password**: `/resetpassword`
- **New Password**: `/newpassword/:pid`

### API

- **Productos**

  - `GET /api/products`: Obtener productos con paginación.
  - `GET /api/products/:pid`: Obtener producto por ID.
  - `POST /api/products`: Crear nuevo producto.
  - `PUT /api/products/:pid`: Actualizar producto.
  - `DELETE /api/products/:pid`: Eliminar producto.

- **Carritos**

  - `GET /api/carts`: Obtener todos los carritos.
  - `GET /api/carts/:cid`: Obtener carrito por ID.
  - `POST /api/carts`: Crear nuevo carrito.
  - `POST /api/carts/:cid/products/:pid`: Agregar producto al carrito.
  - `DELETE /api/carts/:cid/products/:pid`: Eliminar producto del carrito.
  - `PUT /api/carts/:cid`: Actualizar carrito.
  - `PUT /api/carts/:cid/products/:pid`: Actualizar cantidad de producto en el carrito.
  - `DELETE /api/carts/:cid`: Limpiar carrito.
  - `GET /api/carts/:cid/purchase`: Realizar compra.

- **Usuarios**
  - `GET /api/users`: Obtener todos los usuarios.
  - `GET /api/users/premium/:uid`: Convertir usuario a premium.
  - `POST /api/users/:uid/documents`: Subir documentos de usuario.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](./LICENSE.txt) para más detalles.

## Contacto

- **Autor**: [Juan Ignacio Freille](https://github.com/juanfreille)
- **Correo**: juanfreille@gmail.com
