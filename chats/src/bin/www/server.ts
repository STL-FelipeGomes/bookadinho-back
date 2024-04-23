import cluster from 'node:cluster';
import os from 'node:os';
import 'dotenv/config';
import '../../infra/kafka/intex.js';
import { server } from './server.socket.js';

const cpus = os.cpus();
const port = process.env.PORT || 3003;

const onWorkerError = (code: unknown, signal: unknown) => {
  console.debug(code, signal);
};

if (cluster.isPrimary) {
  cpus.forEach(() => {
    const worker = cluster.fork();
    worker.on('error', onWorkerError);
  });

  cluster.on('exit', () => {
    const newWorker = cluster.fork();
    newWorker.on('error', onWorkerError);
    console.debug('\x1b[33m[WORKER PROCESS EXITED]\x1b[0m', newWorker.process.pid);
  });
} else {
  const serverInitialized = server.listen(port, () => {
    console.debug(`\x1b[32m[SERVIDOR UP http://localhost:${port}]\x1b[0m`);
  });
  serverInitialized.on('error', (error: Error) => console.debug(error));
}
