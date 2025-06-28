import { Router } from '@angular/router';
import { PlayerStateService } from '../../../../../../project/ws/viewer/src/lib/player-state.service';
import { TelemetryGeneratorService, AppGlobalService } from '../../../../../../services';
import {PlayerNavigationWidgetComponent} from './player-navigation-widget.component';
import { of } from 'rxjs';

describe('PlayerNavigationWidgetComponent', () => {
    let playerNavigationWidgetComponent: PlayerNavigationWidgetComponent;
    let mockviewerDataSvc: Partial<PlayerStateService> = {};
    let mockrouter: Partial<Router> = {};
    let mocktelemetryGeneratorService: Partial<TelemetryGeneratorService> = {};
    let mockappGlobalService: Partial<AppGlobalService> = {};

    beforeAll(() => {
        playerNavigationWidgetComponent = new PlayerNavigationWidgetComponent(
                mockviewerDataSvc as PlayerStateService,
                mockrouter as Router,
                mocktelemetryGeneratorService as TelemetryGeneratorService,
                mockappGlobalService as AppGlobalService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance', () => {
        expect(playerNavigationWidgetComponent).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should subscribe to playerState and set values', () => {
            const mockPlayerState = {
                prevResource: 'prevResourceUrl',
                nextResource: 'nextResourceUrl',
                currentCompletionPercentage: 100
            };
            mockviewerDataSvc.playerState = of(mockPlayerState) as any;
            mockappGlobalService.getPlayButtonConfig = jest.fn(() => ({
                isBackBtn: false,
                isNextBtn: false
            }));
            playerNavigationWidgetComponent.ngOnInit();

            expect(playerNavigationWidgetComponent.prevResourceUrl).toBe('prevResourceUrl');
            expect(playerNavigationWidgetComponent.nextResourceUrl).toBe('nextResourceUrl');
            expect(playerNavigationWidgetComponent.currentCompletionPercentage).toBe(100);
            expect(playerNavigationWidgetComponent.isPlayNextBtnClicked).toBeTruthy();
        });
    });

    describe('setBtnInfo', () => {
        it('should set button info', () => {
            mockappGlobalService.setPlayButtonConfig = jest.fn();
            playerNavigationWidgetComponent.setBtnInfo(true, false);

            expect(mockappGlobalService.setPlayButtonConfig).toHaveBeenCalled();
        });
    });

    describe('generateInteractTelemetry', () => {
        it('should generate interact telemetry', () => {
            const mockGenerateInteractTelemetry = jest.fn();
            const values = new Map();
            mocktelemetryGeneratorService.generateInteractTelemetry = mockGenerateInteractTelemetry;

            playerNavigationWidgetComponent.generateInteractTelemetry('status', 'identifier');

            expect(mockGenerateInteractTelemetry).toHaveBeenCalledWith(
                'select-content',
                'play-status-content',
                'player',
                'collection-detail',
                undefined,
                values
            );
        });
    }
    );

    describe('navigateToPreResource', () => {
        it('should navigate to previous resource', () => {
            playerNavigationWidgetComponent.prevResourceUrl = 'prevResourceUrl';
            mockrouter.navigate = jest.fn();
            jest.spyOn(playerNavigationWidgetComponent, 'setBtnInfo').mockImplementation(() => {});

            playerNavigationWidgetComponent.navigateToPreResource();

            expect(playerNavigationWidgetComponent.isPlayBackBtnClicked).toBe(true);
            expect(playerNavigationWidgetComponent.isPlayNextBtnClicked).toBe(false);
            expect(mockrouter.navigate).toHaveBeenCalledWith(['prevResourceUrl'], { queryParamsHandling: 'preserve' });
        });
    }
    );

    describe('navigateToNextResource', () => {
        it('should navigate to next resource', () => {
            playerNavigationWidgetComponent.nextResourceUrl = 'nextResourceUrl';
            mockrouter.navigate = jest.fn();
            jest.spyOn(playerNavigationWidgetComponent, 'generateInteractTelemetry').mockImplementation(() => {});
            playerNavigationWidgetComponent.navigateToNextResource();

            expect(mockrouter.navigate).toHaveBeenCalledWith(['nextResourceUrl'], { queryParamsHandling: 'preserve' });
        });
    }
    );

    describe('navigateToNextContent', () => {
        it('should navigate to next content if currentCompletionPercentage is 100', () => {
            playerNavigationWidgetComponent.currentCompletionPercentage = 100;
            playerNavigationWidgetComponent.nextResourceUrl = 'nextResourceUrl';
            mockrouter.navigate = jest.fn();
            jest.spyOn(playerNavigationWidgetComponent, 'setBtnInfo').mockImplementation(() => {});     
            playerNavigationWidgetComponent.navigateToNextContent();

            expect(playerNavigationWidgetComponent.isPlayNextBtnClicked).toBe(true);
            expect(playerNavigationWidgetComponent.isPlayBackBtnClicked).toBe(false);
            expect(mockrouter.navigate).toHaveBeenCalledWith(['nextResourceUrl'], { queryParamsHandling: 'preserve' });
        });

        it('should not navigate to next content if currentCompletionPercentage is not 100', () => {
            playerNavigationWidgetComponent.currentCompletionPercentage = 50;
            playerNavigationWidgetComponent.nextResourceUrl = 'nextResourceUrl';
            mockrouter.navigate = jest.fn();

            playerNavigationWidgetComponent.navigateToNextContent();

            expect(playerNavigationWidgetComponent.isPlayNextBtnClicked).toBe(true);
            expect(playerNavigationWidgetComponent.isPlayBackBtnClicked).toBe(false);
            expect(mockrouter.navigate).not.toHaveBeenCalled();
        });
    }
    );

    describe('isProgressCheck', () => {
        it('should return true if currentCompletionPercentage is 100', () => {
            playerNavigationWidgetComponent.currentCompletionPercentage = 100;

            const result = playerNavigationWidgetComponent.isProgressCheck();

            expect(result).toBe(true);
        });

        it('should return false if currentCompletionPercentage is not 100', () => {
            playerNavigationWidgetComponent.currentCompletionPercentage = 50;

            const result = playerNavigationWidgetComponent.isProgressCheck();

            expect(result).toBe(false);
        });
    }
    );

    describe('stopPropagation', () => {
        it('should return undefined', () => {
            const result = playerNavigationWidgetComponent.stopPropagation();

            expect(result).toBeUndefined();
        });
    }
    );

    describe('ngOnDestroy', () => {
        it('should unsubscribe from playerState', () => {
            const mockUnsubscribe = jest.fn();
            mockviewerDataSvc.playerState = {
                unsubscribe: mockUnsubscribe
            } as any;

            playerNavigationWidgetComponent.ngOnDestroy();
        });
    }
    );
});
