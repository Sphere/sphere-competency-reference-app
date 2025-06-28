import { AuthService } from '@project-sunbird/sunbird-sdk';
import { ConfigService } from './config.service';
import { ConfigurationsService } from '../../../library//ws-widget/utils/src/lib/services/configurations.service';
import { of } from 'rxjs';

describe('ConfigService', () => {
  let service: ConfigService;
  const mockConfigSvc: Partial<ConfigurationsService> = {};
  const mockAuthService: Partial<AuthService> = {};

  beforeAll(() => {
    service = new ConfigService(
      mockConfigSvc as ConfigurationsService,
      mockAuthService as AuthService,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return config', async () => {
    const config = {
      userName: 'test',
      profileData: {
        professionalDetails: 'test'
      },
      language: 'test',
      id: 'test',
      hostPath: 'test',
      isMobileApp: true,
    }
    mockConfigSvc.hostPath = 'test';
    mockAuthService.getSession = jest.fn(() => of(config) as any);
    const res = await service.setConfig({userId: 'test', userName: 'test', profileData: {professionalDetails: 'test'}, language: 'test'});
    expect(mockAuthService.getSession).toHaveBeenCalled();
  });
})
