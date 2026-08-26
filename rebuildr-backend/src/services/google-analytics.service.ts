import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { CmsTrafficStatsResponse } from 'src/resolvers/statistics.resolver';

const CACHE_TTL_MS = 60 * 60 * 1000;
//Bounds the per-range cache so arbitrary date-picker ranges can't grow it
//without limit over the process lifetime.
const CACHE_MAX_ENTRIES = 100;
const TOP_LIST_LIMIT = 5;

/**
 * GA4 Data API wrapper. Optional by design: without GA4_PROPERTY_ID and
 * GA4_SERVICE_ACCOUNT_KEY every call returns null and the admin hides its
 * traffic section. Responses are cached per range — the GA4 quota is shared
 * across the whole property.
 *
 * Coverage caveat: GTM only runs on the web build, so these numbers cover
 * web traffic only, never the native apps.
 */
@Injectable()
export class GoogleAnalyticsService {
  private client?: BetaAnalyticsDataClient;
  private property?: string;
  private cache = new Map<
    string,
    { fetchedAt: number; data: CmsTrafficStatsResponse }
  >();

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const rawKey = process.env.GA4_SERVICE_ACCOUNT_KEY;
    if (!propertyId || !rawKey) {
      return;
    }
    try {
      const credentials = this._parseServiceAccountKey(rawKey);
      this.client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
      });
      this.property = `properties/${propertyId}`;
    } catch (error) {
      this.logger.warn('GA4_SERVICE_ACCOUNT_KEY could not be parsed', {
        error,
      });
    }
  }

  private _parseServiceAccountKey(rawKey: string): {
    client_email: string;
    private_key: string;
  } {
    try {
      return JSON.parse(rawKey);
    } catch {
      return JSON.parse(Buffer.from(rawKey, 'base64').toString('utf8'));
    }
  }

  async getTrafficStats(
    from: string,
    to: string,
  ): Promise<CmsTrafficStatsResponse | null> {
    if (!this.client || !this.property) {
      return null;
    }
    const cacheKey = `${from}:${to}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.data;
    }

    const dateRanges = [{ startDate: from, endDate: to }];
    try {
      const [[totals], [sources], [landingPages], [cities]] = await Promise.all(
        [
          this.client.runReport({
            property: this.property,
            dateRanges,
            metrics: [
              { name: 'sessions' },
              { name: 'totalUsers' },
              { name: 'screenPageViews' },
            ],
          }),
          this.client.runReport({
            property: this.property,
            dateRanges,
            dimensions: [{ name: 'sessionSource' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: TOP_LIST_LIMIT,
          }),
          this.client.runReport({
            property: this.property,
            dateRanges,
            dimensions: [{ name: 'landingPage' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: TOP_LIST_LIMIT,
          }),
          //Sweden-only for now: filter on country so foreign cities don't
          //crowd out the list while the focus is the domestic market.
          this.client.runReport({
            property: this.property,
            dateRanges,
            dimensions: [{ name: 'city' }],
            metrics: [{ name: 'sessions' }],
            dimensionFilter: {
              filter: {
                fieldName: 'country',
                stringFilter: { matchType: 'EXACT', value: 'Sweden' },
              },
            },
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: TOP_LIST_LIMIT,
          }),
        ],
      );

      const totalsRow = totals.rows?.[0]?.metricValues ?? [];
      const data: CmsTrafficStatsResponse = {
        sessions: Number(totalsRow[0]?.value ?? 0),
        totalUsers: Number(totalsRow[1]?.value ?? 0),
        pageViews: Number(totalsRow[2]?.value ?? 0),
        topSources: this._toEntries(sources.rows),
        topLandingPages: this._toEntries(landingPages.rows),
        topCities: this._toEntries(cities.rows),
      };
      //Evict the oldest entry (Map preserves insertion order) once full.
      if (this.cache.size >= CACHE_MAX_ENTRIES) {
        const oldest = this.cache.keys().next().value;
        if (oldest !== undefined) this.cache.delete(oldest);
      }
      this.cache.set(cacheKey, { fetchedAt: Date.now(), data });
      return data;
    } catch (error) {
      this.logger.warn('GA4 traffic report failed', { error });
      return null;
    }
  }

  private _toEntries(
    rows?:
      | {
          dimensionValues?: { value?: string | null }[] | null;
          metricValues?: { value?: string | null }[] | null;
        }[]
      | null,
  ): { name: string; sessions: number }[] {
    return (rows ?? []).map((row) => ({
      name: row.dimensionValues?.[0]?.value ?? '(okänd)',
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
    }));
  }
}
