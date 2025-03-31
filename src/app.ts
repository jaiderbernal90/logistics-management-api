import envs from './infrastructure/config/envs';
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
