import { QueueService } from './queue.service';

(async () => {
  const svc = new QueueService();
  await svc.onModuleInit();
  console.log('Background worker running.');

  // keep process alive
  process.on('SIGINT', async () => {
    await svc.onModuleDestroy();
    process.exit(0);
  });
})();
