import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Queue = require('bull');
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private queue: Queue.Queue;

  constructor() {
    this.queue = new Queue('background-jobs', redisUrl as any);
  }

  async onModuleInit() {
    // set up a simple processor
    this.queue.process(async (job) => {
      try {
        if (job.name === 'send-email') {
          console.log('Sending email job payload:', job.data);
        }
        if (job.name === 'example') {
          console.log('Example job executed', job.data);
        }
        return Promise.resolve();
      } catch (err) {
        console.error('Job error', err);
        throw err;
      }
    });

    this.queue.on('failed', (job, err) => {
      console.error('Job failed', job?.id, err?.message || err);
    });
  }

  async addSendEmailJob(payload: any) {
    await this.queue.add('send-email', payload, { attempts: 3 });
  }

  async addJob(name: string, payload: any, opts: any = {}) {
    await this.queue.add(name, payload, opts);
  }

  async onModuleDestroy() {
    try {
      await this.queue.close();
    } catch (e) {
      // ignore
    }
  }
}
