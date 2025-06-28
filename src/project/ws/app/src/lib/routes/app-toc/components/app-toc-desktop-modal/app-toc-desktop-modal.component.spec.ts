import { MatDialogRef } from '@angular/material/dialog';
import {AppTocDesktopModalComponent} from './app-toc-desktop-modal.component';

describe('AppTocDesktopModalComponent', () => {
    it('should initialize competency data when content type is COMPETENCY', () => {
      const dialogRefMock = { close: jest.fn() } as unknown as MatDialogRef<AppTocDesktopModalComponent>;
      const competencyData = JSON.stringify([{ competencyName: 'Test Competency', level: '3' }]);
      const contentMock = { type: 'COMPETENCY', competency: competencyData, content: {name: 'Test Content', lastPublishedOn: '2023-01-01'} };
      const competencyDataSpy = jest.spyOn(AppTocDesktopModalComponent.prototype, 'competencyData');
      const component = new AppTocDesktopModalComponent(dialogRefMock, contentMock);
      jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
      // act
      component.ngOnInit();
      // Assertions
      expect(competencyDataSpy).toHaveBeenCalledWith(competencyData);
      expect(component.cometencyData.length).toBeGreaterThan(0);
      expect(component.cometencyData[0].name).toBe('Test Competency');
      expect(component.cometencyData[0].levels).toBe(' Level 3');
    });
})