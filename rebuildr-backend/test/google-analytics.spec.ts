import { Test } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GoogleAnalyticsService } from 'src/services/google-analytics.service';

describe('GoogleAnalyticsService', () => {
  const loggerMock = { warn: jest.fn() };
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
    jest.resetAllMocks();
  });

  async function createService(): Promise<GoogleAnalyticsService> {
    const module = await Test.createTestingModule({
      providers: [
        GoogleAnalyticsService,
        { provide: WINSTON_MODULE_PROVIDER, useValue: loggerMock },
      ],
    }).compile();
    return module.get(GoogleAnalyticsService);
  }

  it('returns null when GA4 env vars are not configured', async () => {
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GA4_SERVICE_ACCOUNT_KEY;

    const service = await createService();

    await expect(
      service.getTrafficStats('2026-07-01', '2026-07-31'),
    ).resolves.toBeNull();
  });

  it('returns null and warns when the key cannot be parsed', async () => {
    process.env.GA4_PROPERTY_ID = '123456';
    process.env.GA4_SERVICE_ACCOUNT_KEY = 'not-json-not-base64!!';

    const service = await createService();

    await expect(
      service.getTrafficStats('2026-07-01', '2026-07-31'),
    ).resolves.toBeNull();
    expect(loggerMock.warn).toHaveBeenCalled();
  });

  describe('with a configured client', () => {
    async function createConfiguredService() {
      const { serviceAccountKey } = getFixtures();
      process.env.GA4_PROPERTY_ID = '123456';
      process.env.GA4_SERVICE_ACCOUNT_KEY = Buffer.from(
        JSON.stringify(serviceAccountKey),
      ).toString('base64');

      const service = await createService();
      const runReport = jest.fn();
      //Replace the real API client; report shapes come from fixtures.
      (service as unknown as { client: { runReport: jest.Mock } }).client = {
        runReport,
      };
      return { service, runReport };
    }

    it('maps totals and top lists from the GA4 reports', async () => {
      const { service, runReport } = await createConfiguredService();
      const { totalsReport, sourcesReport, landingPagesReport, citiesReport } =
        getFixtures();
      runReport
        .mockResolvedValueOnce([totalsReport])
        .mockResolvedValueOnce([sourcesReport])
        .mockResolvedValueOnce([landingPagesReport])
        .mockResolvedValueOnce([citiesReport]);

      const stats = await service.getTrafficStats('2026-07-01', '2026-07-31');

      expect(stats).toEqual({
        sessions: 1200,
        totalUsers: 800,
        pageViews: 4000,
        topSources: [
          { name: 'google', sessions: 700 },
          { name: '(direct)', sessions: 300 },
        ],
        topLandingPages: [{ name: '/', sessions: 900 }],
        topCities: [
          { name: 'Stockholm', sessions: 500 },
          { name: 'Göteborg', sessions: 200 },
        ],
      });
    });

    it('caches responses per range', async () => {
      const { service, runReport } = await createConfiguredService();
      const { totalsReport, sourcesReport, landingPagesReport, citiesReport } =
        getFixtures();
      runReport
        .mockResolvedValueOnce([totalsReport])
        .mockResolvedValueOnce([sourcesReport])
        .mockResolvedValueOnce([landingPagesReport])
        .mockResolvedValueOnce([citiesReport]);

      await service.getTrafficStats('2026-07-01', '2026-07-31');
      await service.getTrafficStats('2026-07-01', '2026-07-31');

      expect(runReport).toHaveBeenCalledTimes(4);
    });

    it('returns null and warns when the GA4 API fails', async () => {
      const { service, runReport } = await createConfiguredService();
      runReport.mockRejectedValue(new Error('quota exceeded'));

      await expect(
        service.getTrafficStats('2026-07-01', '2026-07-31'),
      ).resolves.toBeNull();
      expect(loggerMock.warn).toHaveBeenCalled();
    });
  });

  function getFixtures() {
    const serviceAccountKey = {
      client_email: 'stats@test.iam.gserviceaccount.com',
      private_key:
        '-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----\n',
    };
    const totalsReport = {
      rows: [
        {
          metricValues: [
            { value: '1200' },
            { value: '800' },
            { value: '4000' },
          ],
        },
      ],
    };
    const sourcesReport = {
      rows: [
        {
          dimensionValues: [{ value: 'google' }],
          metricValues: [{ value: '700' }],
        },
        {
          dimensionValues: [{ value: '(direct)' }],
          metricValues: [{ value: '300' }],
        },
      ],
    };
    const landingPagesReport = {
      rows: [
        {
          dimensionValues: [{ value: '/' }],
          metricValues: [{ value: '900' }],
        },
      ],
    };
    const citiesReport = {
      rows: [
        {
          dimensionValues: [{ value: 'Stockholm' }],
          metricValues: [{ value: '500' }],
        },
        {
          dimensionValues: [{ value: 'Göteborg' }],
          metricValues: [{ value: '200' }],
        },
      ],
    };
    return {
      serviceAccountKey,
      totalsReport,
      sourcesReport,
      landingPagesReport,
      citiesReport,
    };
  }
});
