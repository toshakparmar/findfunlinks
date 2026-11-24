import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();

    const logger = this.logger;

    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const maxRetries = 3;
            let attempt = 0;
            while (true) {
              try {
                return await query(args);
              } catch (error: any) {
                attempt++;
                const msg = error?.message || '';
                const code = error?.code || '';
                const isTransient =
                  code === 'P1001' || // Can't reach database server
                  code === 'P1002' || // Database server reached but timed out
                  code === 'P1017' || // Server has closed the connection
                  code === 'P2024' || // Timed out fetching a new connection from the pool
                  msg.includes('Server has closed the connection') ||
                  msg.includes('Timed out fetching a new connection') ||
                  msg.includes("Can't reach database server") ||
                  msg.includes('connection pool') ||
                  msg.includes('Connection closed');

                if (isTransient && attempt < maxRetries) {
                  const delayMs = attempt * 300;
                  logger.warn(
                    `[DB Transient Error] ${model}.${operation} failed with "${code || msg.slice(0, 80)}". Auto-retrying (attempt ${attempt}/${maxRetries}) in ${delayMs}ms...`,
                  );
                  await new Promise((resolve) => setTimeout(resolve, delayMs));
                  continue;
                }
                throw error;
              }
            }
          },
        },
      },
    });

    return extended as any;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
