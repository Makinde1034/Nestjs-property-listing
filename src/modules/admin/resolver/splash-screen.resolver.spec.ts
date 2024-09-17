import { Test, TestingModule } from '@nestjs/testing';
import { SplashScreenResolver } from './splash-screen.resolver';

describe('SplashScreenResolver', () => {
  let resolver: SplashScreenResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SplashScreenResolver],
    }).compile();

    resolver = module.get<SplashScreenResolver>(SplashScreenResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
