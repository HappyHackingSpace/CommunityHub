import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const dataSource = { query: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('returns ok when the database responds', async () => {
      dataSource.query.mockResolvedValue([{ '?column?': 1 }]);
      const health = await appController.getHealth();
      expect(health.status).toBe('ok');
      expect(health.checks.database).toBe('up');
      expect(typeof health.uptime).toBe('number');
    });

    it('throws 503 when the database is unreachable', async () => {
      dataSource.query.mockRejectedValue(new Error('connection refused'));
      await expect(appController.getHealth()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });
});
