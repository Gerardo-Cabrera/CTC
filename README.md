# Instrucciones para ejecutar el proyecto CTC

- Recomendable crear una carpeta en un directorio local para clonar el proyecto.
- Una vez clonado el proyecto instalar NodeJS, npm y composer si no están instalados.
- Ingresar en la carpeta laravel del proyecto y ejecutar los comandos **composer install** y **npm install** para que instale las dependencias que son utilizadas por laravel.
- Ingresar en la carpeta react del proyecto y ejecutar el comando **npm install** para que instale las dependencias que son utilizadas por react.
- En la carpeta de laravel, en el archivo **.env** especificar el usuario y la contraseña para conectarse a base de datos PostgreSQL.
- Posicionado en la carpeta de laravel, ejecutar el comando **php artisan migrate** para crear en base de datos las tablas correspondiente **php artisan db:seed --class=SeederState** para agregar los estados a la tabla **states**.
- Posicionado en la carpeta de laravel, ejecutar el comando **php artisan serve** para ejecutar el servidor de laravel.
- Posicionado en la carpeta de react, ejecutar el comando **npm start** para ejecutar el front de la aplicación. 
