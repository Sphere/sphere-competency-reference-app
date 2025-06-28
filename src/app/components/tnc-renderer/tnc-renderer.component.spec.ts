import { TncRendererComponent } from './tnc-renderer.component';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationsService } from '../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { of } from 'rxjs';

describe('TncRendererComponent', () => {
  let component: TncRendererComponent;
  const mockConfigSvc: Partial<ConfigurationsService> = {
    restrictedFeatures: new Set<string>(['termsOfUser'])
  }
  const mockRoute: Partial<ActivatedRoute> = {}

  beforeAll(() => {
    component = new TncRendererComponent(
      mockConfigSvc as ConfigurationsService,
      mockRoute as ActivatedRoute
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call general TNC for dp pannel', () => {
      mockRoute.queryParams = of({
        panel: 'dp'
      })
      component.tncData = {
        termsAndConditions: [
          { name: 'Generic T&C', language: 'en', version: '1.0' },
          { name: 'Data Privacy', language: 'en', version: '1.0' },]
      } as any
      component.ngOnInit();
      // assert
      expect(component.currentPanel).toBe('dp');
      expect(component.dpTnc).toEqual({ name: 'Data Privacy', language: 'en', version: '1.0' });
    });

    it('should call dp TNC for tnc pannel', () => {
      mockRoute.queryParams = of({
        panel: 'tnc'
      })
      component.tncData = {
        termsAndConditions: [
          { name: 'Generic T&C', language: 'en', version: '1.0' },
          { name: 'Data Privacy', language: 'en', version: '1.0' },]
      } as any
      component.ngOnInit();
      expect(component.currentPanel).toBe('tnc');
      expect(component.generalTnc).toEqual({ name: 'Generic T&C', language: 'en', version: '1.0' });
    });
  });

  it('should invoke the ngOnChanges', () => {
    component.tncData = {
      termsAndConditions: [
        { name: 'Generic T&C', language: 'en', version: '1.0' },
        { name: 'Data Privacy', language: 'en', version: '1.0' },]
    } as any
    component.ngOnChanges();
    expect(component.tncData).toBeTruthy();
  })

  it('should point the tnc panel to the top', () => {
    const mockElement = {
      scrollIntoView: jest.fn()
    };
    document.getElementById = jest.fn().mockReturnValue(mockElement);
    // act
    component.reCenterPanel();
    //assert
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('should emit the tncChange event', () => {
    // arrange
    mockRoute.queryParams = of({
      panel: 'tnc'
    })
    component.tncData = {
      termsAndConditions: [
        { name: 'Generic T&C', language: 'en', version: '1.0' },
        { name: 'Data Privacy', language: 'en', version: '1.0' },]
    } as any
    // act
    component.tncChange.emit('en');
    component.changeTncLang('en');
    // assert
    expect(component.tncData).toBeTruthy();
  });

  it('should emit the dpChange event', () => {
    // arrange
    mockRoute.queryParams = of({
      panel: 'dp'
    })
    component.tncData = {
      termsAndConditions: [
        { name: 'Generic T&C', language: 'en', version: '1.0' },
        { name: 'Data Privacy', language: 'en', version: '1.0' },]    } as any
    // act
    component.dpChange.emit('en');
    component.changeDpLang('en');
    // assert
    expect(component.tncData).toBeTruthy();
  });
});
