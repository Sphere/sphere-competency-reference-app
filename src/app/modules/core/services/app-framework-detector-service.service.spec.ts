import { TestBed } from '@angular/core/testing';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { AppFrameworkDetectorService } from './app-framework-detector-service.service';

describe('AppFrameworkDetectorService', () => {
  let service: AppFrameworkDetectorService;
  let appVersionSpy: jest.Mocked<AppVersion>;

  beforeEach(() => {
    const spy = {
      getPackageName: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AppFrameworkDetectorService,
        { provide: AppVersion, useValue: spy }
      ]
    });

    service = TestBed.inject(AppFrameworkDetectorService);
    appVersionSpy = TestBed.inject(AppVersion) as jest.Mocked<AppVersion>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return package name', async () => {
    const packageName = 'com.aastrika.sphere';
    appVersionSpy.getPackageName.mockResolvedValue(packageName);

    const result = await service.getPackageName();
    expect(result).toBe(packageName);
  });

  it('should handle error when getting package name', async () => {
    appVersionSpy.getPackageName.mockRejectedValue('Error');

    const result = await service.getPackageName();
    expect(result).toBe('');
  });

  it('should detect Sphere app', () => {
    const packageName = 'com.aastrika.sphere';
    const result = service.isSphereApp(packageName);
    expect(result).toBe(true);
  });

  it('should detect Ekshamata app', () => {
    const packageName = 'org.aastrika.ekshamata';
    const result = service.isEkshamataApp(packageName);
    expect(result).toBe(true);
  });

  it('should detect app framework as Sphere', async () => {
    const packageName = 'com.aastrika.sphere';
    appVersionSpy.getPackageName.mockResolvedValue(packageName);

    const result = await service.detectAppFramework();
    expect(result).toBe('Sphere');
  });

  it('should detect app framework as Ekshamata', async () => {
    const packageName = 'org.aastrika.ekshamata';
    appVersionSpy.getPackageName.mockResolvedValue(packageName);

    const result = await service.detectAppFramework();
    expect(result).toBe('Ekshamata');
  });

  it('should detect app framework as Unknown', async () => {
    const packageName = 'com.unknown.app';
    appVersionSpy.getPackageName.mockResolvedValue(packageName);

    const result = await service.detectAppFramework();
    expect(result).toBe('Unknown');
  });
});
