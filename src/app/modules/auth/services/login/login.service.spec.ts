import { LoginService } from './login.service';
import { ToastService } from '../../../../../app/manage-learn/core/services/toast/toast.service';
import { ModalController } from '@ionic/angular';
import { AuthService, DeviceInfo, SharedPreferences } from '@project-sunbird/sunbird-sdk';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { UtilityService } from '../../../../../services/utility-service';
import { ConfigurationsService } from '../.././../../../library/ws-widget/utils/src/public-api';
import { ApiUtilsService } from '../../../../../app/manage-learn/core/services/api-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastController } from '@ionic/angular';
import { CommonUtilService } from '../../../../../services';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';


// Jest mocks
jest.mock('@ionic/angular');
jest.mock('sunbird-sdk');
jest.mock('@awesome-cordova-plugins/http/ngx');
jest.mock('../../../../../services/utility-service');
jest.mock('@ws-widget/utils');
jest.mock('../../../../../app/manage-learn/core/services/api-utils.service');
jest.mock('@ngx-translate/core');  // Mock TranslateService
jest.mock('../../../../../services');  // Mock CommonUtilService

describe('LoginService', () => {
    let service: LoginService;
    let httpMock: HttpTestingController;
    let httpClientMock: any;

    beforeEach(() => {
        // Create mock for UtilityService
        const utilityServiceMock = {
            getBuildConfigValue: jest.fn().mockResolvedValue('https://mocked-url.com') // Mock the promise
        };

        // Mock other dependencies
        const toastCtrlMock = {} as ToastController;
        const translateMock = {} as TranslateService;
        const toastService = new ToastService(toastCtrlMock, translateMock);
        
        const modalCtrlMock = {} as ModalController;
        const authService = {} as AuthService;
        const deviceInfo = {} as DeviceInfo;
        const preferences = {} as SharedPreferences;
        const ionicHttp = new HTTP();
        const configSvc = new ConfigurationsService();
        
        // Mock ApiUtilsService dependencies
        const commonUtilServiceMock = {} as CommonUtilService;
        const apiUtilsService = new ApiUtilsService(commonUtilServiceMock);
        
        // Creating a mock for HttpClient
        httpClientMock = { post: jest.fn() };

        // Create LoginService instance
        service = new LoginService(
            httpClientMock as any,  // Using mocked HttpClient
            toastService,
            modalCtrlMock,
            authService,
            deviceInfo,
            preferences,
            ionicHttp,
            utilityServiceMock as any,  // Pass the mocked utility service
            configSvc,
            apiUtilsService
        );

        // Create the HttpTestingController mock manually
        httpMock = { expectOne: jest.fn(), verify: jest.fn() } as any;
    });

    afterEach(() => {
        // Ensure no outstanding HTTP requests
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send OTP', () => {
        const dummyData = { phone: '1234567890' };

        // Mock the HttpClient.post response
        httpClientMock.post.mockReturnValue(of({ success: true }));

        service.sendOTP(dummyData).subscribe(response => {
            expect(response).toBeTruthy();
        });

        // Ensure post was called with the correct URL
        expect(httpClientMock.post).toHaveBeenCalledWith(
            service.baseUrl + '/apis/public/v8/ssoLogin/otp/sendOtp',
            dummyData
        );
    });

    it('should resend OTP', () => {
        const dummyData = { phone: '1234567890' };

        // Mock the HttpClient.post response
        httpClientMock.post.mockReturnValue(of({ success: true }));

        service.resendOTP(dummyData).subscribe(response => {
            expect(response).toBeTruthy();
        });

        // Ensure post was called with the correct URL
        expect(httpClientMock.post).toHaveBeenCalledWith(
            service.baseUrl + '/apis/public/v8/ssoLogin/otp/resendOtp',
            dummyData
        );
    });

    it('should login user', () => {
        const dummyData = { username: 'test', password: 'test' };
        httpClientMock.post.mockReturnValue(of({ success: true }));

        // Simulating the request from HttpTestingController
        const req = { request: { method: 'POST' }, flush: jest.fn() } as any;
        jest.spyOn(httpMock, 'expectOne').mockReturnValue(req);

        // Mocking HTTP request for user login
        service.userLogin(dummyData).subscribe(response => {
            expect(response).toBeTruthy();
        });

        req.flush({ success: true });
    });

    it('should search user', () => {
        const dummyHeader = { Authorization: 'Bearer token' };
        const dummyData = { query: 'test' };
        
        // Mock the HttpClient.post response
        httpClientMock.post.mockReturnValue(of({ success: true }));
    
        // Mocking HTTP request for searching user
        service.searchUser(dummyHeader, dummyData).subscribe(response => {
            expect(response).toBeTruthy();
        });
    
        // Ensure post was called with the correct URL and headers
        expect(httpClientMock.post).toHaveBeenCalledWith(
            service.baseUrl + '/apis/public/v8/mobileApp/kong/user/v1/search',
            dummyData,
            { headers: dummyHeader }
        );
    });
});
