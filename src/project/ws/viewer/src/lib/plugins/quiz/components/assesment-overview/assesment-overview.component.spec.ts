import {AssesmentOverviewComponent} from './assesment-overview.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Environment, InteractType, PageId, TelemetryGeneratorService } from '../../../../../../../../../services';

describe('AssesmentOverviewComponent', () => {
    let assesmentOverviewComponent: AssesmentOverviewComponent;
    const mockdialogRef: Partial<MatDialogRef<AssesmentOverviewComponent>> = {
            close: jest.fn(),
            afterClosed: jest.fn().mockReturnValue({ subscribe: jest.fn() })
    };
    const mockassesmentdata: any = {};
    const mockroute: Partial<ActivatedRoute> = {
        snapshot: {
            queryParams: {
                competency: 'sample-competency',
                isAsha: true
            }
        }
    } as any;
    const mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {
        generateInteractTelemetry: jest.fn()
    };
    const mockplatform: Partial<Platform> = {
        is: jest.fn()
    };


    beforeAll(() => {
        assesmentOverviewComponent = new AssesmentOverviewComponent(
            mockdialogRef as MatDialogRef<AssesmentOverviewComponent>,
            mockassesmentdata as any,
            mockroute as ActivatedRoute,
            mocktelemetryGeneratorService as TelemetryGeneratorService,
            mockplatform as Platform
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of AssesmentOverviewComponent', () => {
        expect(assesmentOverviewComponent).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call handleDeviceBackButton for asha', () => {
            mockroute.snapshot = {
                queryParams: {
                    competency: true,
                    isAsha: true
                }
            } as any;
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockplatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockdialogRef.close = jest.fn();
            mocktelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            assesmentOverviewComponent.ngOnInit();
            // assert
            expect(subscribeWithPriorityData).toHaveBeenCalledWith(10, expect.any(Function));
            expect(mockdialogRef.close).toHaveBeenCalledWith(
                {
                    event: 'close-overview',
                    asha: true
                }
            );
            expect(mocktelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(true, Environment.PLAYER, PageId.ASSESSMENT_OVERVIEW);
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                      'close-assessment-popup',
                      Environment.PLAYER,
                      PageId.ASSESSMENT_OVERVIEW);
        });

        it('should call handleDeviceBackButton not for asha', () => {
            mockroute.snapshot = {
                queryParams: {
                    competency: true,
                    isAsha: false
                }
            } as any;
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockplatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockdialogRef.close = jest.fn();
            mocktelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            assesmentOverviewComponent.ngOnInit();
            // assert
            expect(subscribeWithPriorityData).toHaveBeenCalledWith(10, expect.any(Function));
            expect(mockdialogRef.close).toHaveBeenCalledWith(
                {
                    event: 'close-overview',
                    competency: true
                }
            );
            expect(mocktelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(true, Environment.PLAYER, PageId.ASSESSMENT_OVERVIEW);
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                      'close-assessment-popup',
                      Environment.PLAYER,
                      PageId.ASSESSMENT_OVERVIEW);
        });

         it('should call handleDeviceBackButton not for competency', () => {
            mockroute.snapshot = {
                queryParams: {
                    competency: false,
                    isAsha: false
                }
            } as any;
            const subscribeWithPriorityData = jest.fn((_, fn) => fn());
            mockplatform.backButton = {
                subscribeWithPriority: subscribeWithPriorityData
            } as any;
            mockdialogRef.close = jest.fn();
            mocktelemetryGeneratorService.generateBackClickedNewTelemetry = jest.fn();
            mocktelemetryGeneratorService.generateInteractTelemetry = jest.fn();
            // act
            assesmentOverviewComponent.ngOnInit();
            // assert
            expect(subscribeWithPriorityData).toHaveBeenCalledWith(10, expect.any(Function));
            expect(mockdialogRef.close).toHaveBeenCalledWith(
                {
                    event: 'close-overview'
                }
            );
            expect(mocktelemetryGeneratorService.generateBackClickedNewTelemetry).toHaveBeenCalledWith(true, Environment.PLAYER, PageId.ASSESSMENT_OVERVIEW);
            expect(mocktelemetryGeneratorService.generateInteractTelemetry).toHaveBeenCalledWith(InteractType.TOUCH,
                      'close-assessment-popup',
                      Environment.PLAYER,
                      PageId.ASSESSMENT_OVERVIEW);
        });
    });
});