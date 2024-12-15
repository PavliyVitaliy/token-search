import { Injectable } from '@nestjs/common';
import { Counter, Meter, metrics } from '@opentelemetry/api';

@Injectable()
export class MetricsService {
    private meter: Meter;
    public requestCount: Counter;
    public cacheHits: Counter;
    public cacheMisses: Counter;
    public cacheSetSuccesses: Counter;
    public cacheSetFailures: Counter;

    constructor() {
        this.meter = metrics.getMeter('search-bar-metrics');
        
        this.requestCount = this.meter.createCounter('request_count', {
            description: 'Count of all incoming requests',
        });

        this.cacheHits = this.meter.createCounter('cache_hits', {
            description: 'Number of cache hits',
        });

        this.cacheMisses = this.meter.createCounter('cache_misses', {
            description: 'Number of cache misses',
        });

        this.cacheSetSuccesses = this.meter.createCounter('cache_set_successes', {
            description: 'Number of successful cache set operations',
        });
      
          this.cacheSetFailures = this.meter.createCounter('cache_set_failures', {
            description: 'Number of failed cache set operations',
        });
    }
}
