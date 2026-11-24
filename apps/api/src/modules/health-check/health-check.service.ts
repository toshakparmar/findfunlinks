import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainStatus as PrismaDomainStatus } from '@prisma/client';
import * as dns from 'dns';
import * as http from 'http';
import * as https from 'https';

const SSRF_BLOCKED_RANGES = [
  /^127\./, // 127.0.0.0/8 Loopback
  /^10\./, // 10.0.0.0/8 Private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 Private
  /^192\.168\./, // 192.168.0.0/16 Private
  /^169\.254\./, // 169.254.0.0/16 Link-local
  /^0\./, // Current network
  /^::1$/, // IPv6 loopback
  /^fc00:/i, // IPv6 unique local
  /^fe80:/i, // IPv6 link-local
];

export interface ProbeResult {
  statusCode: number | null;
  responseMs: number;
  isUp: boolean;
  error?: string;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly timeoutMs = 5000;
  private readonly maxConsecutiveFailuresForDown = 3;

  constructor(private readonly prisma: PrismaService) {}

  private isPrivateIp(ip: string): boolean {
    return SSRF_BLOCKED_RANGES.some((regex) => regex.test(ip));
  }

  async verifySsrfSafe(hostname: string): Promise<string> {
    try {
      const lookupResult = await dns.promises.lookup(hostname, { all: true });
      if (!lookupResult || lookupResult.length === 0) {
        throw new Error(`DNS resolution failed for hostname "${hostname}"`);
      }

      for (const entry of lookupResult) {
        if (this.isPrivateIp(entry.address)) {
          throw new Error(
            `SSRF Protection: Hostname "${hostname}" resolves to protected/private IP address "${entry.address}".`,
          );
        }
      }

      return lookupResult[0]!.address;
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : 'DNS lookup error');
    }
  }

  private executeHttpRequest(
    targetUrl: string,
    method: 'HEAD' | 'GET' = 'HEAD',
    redirectCount = 0,
  ): Promise<{ statusCode: number; responseMs: number }> {
    return new Promise((resolve, reject) => {
      if (redirectCount > 3) {
        return reject(new Error('Exceeded maximum redirect limit (3)'));
      }

      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const startTime = Date.now();

      const req = client.request(
        parsedUrl,
        {
          method,
          timeout: this.timeoutMs,
          headers: {
            'User-Agent': 'FinalLinks-HealthCheck/1.0 (+https://finallinks.com)',
            Accept: '*/*',
          },
        },
        (res) => {
          const duration = Date.now() - startTime;
          const status = res.statusCode || 0;

          // Follow redirect if 301, 302, 307, 308
          if ([301, 302, 307, 308].includes(status) && res.headers.location) {
            req.destroy();
            const nextUrl = new URL(res.headers.location, targetUrl).toString();
            this.executeHttpRequest(nextUrl, method, redirectCount + 1)
              .then(resolve)
              .catch(reject);
            return;
          }

          // If HEAD returned 405 Method Not Allowed, fallback to GET
          if (method === 'HEAD' && status === 405) {
            req.destroy();
            this.executeHttpRequest(targetUrl, 'GET', redirectCount).then(resolve).catch(reject);
            return;
          }

          // Consume response data to release socket
          res.resume();
          resolve({ statusCode: status, responseMs: duration });
        },
      );

      req.on('timeout', () => {
        req.destroy(new Error(`Probe timed out after ${this.timeoutMs}ms`));
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    });
  }

  async probeUrl(targetUrl: string): Promise<ProbeResult> {
    const startTime = Date.now();
    try {
      const parsedUrl = new URL(targetUrl);
      await this.verifySsrfSafe(parsedUrl.hostname);

      const { statusCode, responseMs } = await this.executeHttpRequest(targetUrl);
      const isUp = statusCode >= 200 && statusCode < 400;

      return {
        statusCode,
        responseMs,
        isUp,
      };
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        statusCode: null,
        responseMs: duration,
        isUp: false,
        error: errorMsg,
      };
    }
  }

  async checkDomain(domainId: string) {
    const domain = await this.prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      throw new NotFoundException(`Domain with ID "${domainId}" not found`);
    }

    const probe = await this.probeUrl(domain.url);

    let consecutiveFailures = domain.consecutiveFailures;
    let newStatus = domain.status;

    if (probe.isUp) {
      consecutiveFailures = 0;
      newStatus = PrismaDomainStatus.ACTIVE;
    } else {
      consecutiveFailures += 1;
      if (consecutiveFailures >= this.maxConsecutiveFailuresForDown) {
        newStatus = PrismaDomainStatus.DOWN;
      }
    }

    const checkedAt = new Date();

    const [updatedDomain] = await this.prisma.$transaction([
      this.prisma.domain.update({
        where: { id: domain.id },
        data: {
          lastCheckedAt: checkedAt,
          lastResponseMs: probe.responseMs,
          lastStatusCode: probe.statusCode,
          consecutiveFailures,
          status: newStatus,
        },
      }),
      this.prisma.domainCheck.create({
        data: {
          domainId: domain.id,
          status: probe.isUp ? PrismaDomainStatus.ACTIVE : PrismaDomainStatus.DOWN,
          responseMs: probe.responseMs,
          statusCode: probe.statusCode,
          checkedAt,
        },
      }),
    ]);

    this.logger.log(
      `Health check for "${domain.hostname}": ${probe.isUp ? 'UP' : 'DOWN'} (Status: ${probe.statusCode}, Latency: ${probe.responseMs}ms, Failures: ${consecutiveFailures})`,
    );

    return {
      domain: updatedDomain,
      probe,
    };
  }

  async checkAllDueDomains(batchSize = 25) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const dueDomains = await this.prisma.domain.findMany({
      where: {
        status: { not: PrismaDomainStatus.BLOCKED },
        OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: thirtyMinutesAgo } }],
      },
      take: batchSize,
      orderBy: { lastCheckedAt: 'asc' },
    });

    this.logger.log(`Found ${dueDomains.length} domains due for health check`);

    const results = [];
    for (const d of dueDomains) {
      try {
        const res = await this.checkDomain(d.id);
        results.push(res);
      } catch (err: unknown) {
        this.logger.error(`Error checking domain ${d.hostname}: ${err}`);
      }
    }

    return {
      checkedCount: results.length,
      results,
    };
  }
}
