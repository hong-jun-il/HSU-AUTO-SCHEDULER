import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerController } from '../crawler.controller';
import { TransactionService } from '../services/crawler.service';
import { PersistenceService } from '../services/persistence.service';

describe('CrawlerController', () => {
  let controller: CrawlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrawlerController],
      providers: [TransactionService, PersistenceService],
    }).compile();

    controller = module.get<CrawlerController>(CrawlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
