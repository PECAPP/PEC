import { FeatureFlagsService } from './feature-flags.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      featureFlag: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    } as any;

    service = new FeatureFlagsService(prisma);
  });

  it('listAll should return feature flags', async () => {
    const rows = [{ key: 'college-settings' }];
    jest.spyOn(prisma.featureFlag, 'findMany').mockResolvedValue(rows as any);

    const result = await service.listAll();

    expect(result).toBe(rows);
  });

  it('getByKey should upsert college settings when missing', async () => {
    jest.spyOn(prisma.featureFlag, 'findUnique').mockResolvedValue(null as any);
    const upserted = {
      key: 'college-settings',
      enabled: true,
      description: 'College settings',
      payload: JSON.stringify({ attendanceRequiredPercentage: 75 }),
      updatedAt: new Date(),
    };
    jest.spyOn(prisma.featureFlag, 'upsert').mockResolvedValue(upserted as any);

    const result = await service.getByKey('college-settings');

    expect(prisma.featureFlag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'college-settings' },
        create: expect.objectContaining({ key: 'college-settings' }),
      }),
    );
    expect(result).toBe(upserted);
  });
});
