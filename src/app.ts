import envs from './infrastructure/config/envs';
import { db } from './infrastructure/database/database.config';
import { AppRoutes } from './infrastructure/http/routes';
import { Server } from './infrastructure/http/server';

(async () => {
  main();
})();

function main() {
  const server = new Server({
    port: envs.port,
    routes: AppRoutes.routes,
  });

  server.start();
}

// Función para cierre controlado
const gracefulShutdown = async () => {
  console.log('Cerrando aplicación de forma controlada...');

  try {
    // Cerrar conexión a la base de datos
    await db.end();
    console.log('Recursos liberados correctamente');
  } catch (error) {
    console.error('Error al cerrar recursos:', error);
  } finally {
    process.exit(0);
  }
};
