import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CordovaHttpService } from '../../core/services/cordova-http.service';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { ModalController } from '@ionic/angular';
import { AuthService, DeviceInfo, SharedPreferences } from 'sunbird-sdk';
import { ToastService } from '../../../../app/manage-learn/core/services/toast/toast.service';
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import * as _ from "lodash"
import { BehaviorSubject } from 'rxjs';
import { buildConfig } from '../../../../../configurations/configuration';
import { API_END_POINTS } from '../../../apiConstants';
@Injectable({
    providedIn: 'root'
})
export class ObservationService extends CordovaHttpService {
    public _updateValue = new BehaviorSubject<any>(undefined)
    updateValue$ = this._updateValue.asObservable()
    isAuthenticated = false
    private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    constructor(
        public http: HttpClient,
        public toast: ToastService,
        public modalController: ModalController,
        @Inject('AUTH_SERVICE') public authService: AuthService,
        @Inject('DEVICE_INFO') public deviceInfo: DeviceInfo,
        @Inject('SHARED_PREFERENCES') public preferences: SharedPreferences,
        public ionicHttp: HTTP,
        public configSvc: ConfigurationsService
    ) {
        super(http, toast, modalController, authService, deviceInfo, preferences, ionicHttp);
        !this.baseUrl ? 'https://' +buildConfig.SITEPATH : '';
    }

    getAllMenteeForMentor(mentorId) {
        const requestParam = {
            url: API_END_POINTS.GET_MENTEE_FOR_MENTOR,
            payload: { mentorId: mentorId }
        };
        return this.get(requestParam)
    }

    getAllObservationForMentee(menteeId) {
        const requestParam = {
            url: API_END_POINTS.GET_OBSERVATION_FOR_MENTEE,
            payload: { menteeId: menteeId }
        };
        return this.get(requestParam)
    }

    sendOtp(menteeId) {
        const requestParam = {
            url: API_END_POINTS.SEND_OTP,
            payload: { menteeId: menteeId }
        };
        return this.get(requestParam)
    }

    resendOtp(menteeId) {
        const requestParam = {
            url: API_END_POINTS.RESEND_OTP,
            payload: { menteeId: menteeId }
        };
        return this.get(requestParam)
    }

    observationOtpVerification(param) {
        const requestParam = {
            url: API_END_POINTS.OTP_VERIFICATION,
            payload: param
        };
        return this.post(requestParam)
    }

    getobservationDetails(urlParam, param) {
        let urlParamStr = '?' + this.objectToUrlParams(urlParam);

        const requestParam = {
            url: API_END_POINTS.GET_OBSERVATION_DETAILS + urlParamStr,
            payload: param
        };
        return this.post(requestParam)
    }

    objectToUrlParams(obj) {
        return Object.entries(obj)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
    }

    addEntityToObservation(param) {
        let urlParamStr = '?' + this.objectToUrlParams(param);
        const requestParam = {
            url: API_END_POINTS.ADD_ENITITY_OBSERVATION + urlParamStr,
            payload: param
        };
        return this.post(requestParam)
    }

    submitObservation(param) {
        // let urlParamStr = '?' + this.objectToUrlParams(urlParam);
        const requestParam = {
            url: API_END_POINTS.SUBMIT_OBSERVATION,
            payload: param
        };
        return this.post(requestParam)
    }

    getObservationSubmissionResult(param) {
        const requestParam = {
            url: API_END_POINTS.GET_SUBMISSION_RESULT,
            payload: param
        };
        return this.post(requestParam)
    }

    updateSubmissionandCompetency(param) {
        const requestParam = {
            url: API_END_POINTS.UPDATE_SUBMISSION_AND_COMPETENCY,
            payload: param
        };
        return this.post(requestParam)
    }

    getMentorsObservation(param) {
        const requestParam = {
            url: API_END_POINTS.GET_MENTORS_OBSERVATION,
            payload: param
        };
        return this.post(requestParam)
    }

    getMentorObservationCount(param) {
        const requestParam = {
            url: API_END_POINTS.GET_MENTOR_OBSERVATION_COUNT,
            payload: param
        };
        return this.get(requestParam)
    }

    getMenteeAttemps(param) {
        const requestParam = {
            url: API_END_POINTS.GET_MENTEE_ATTEMPTS,
            payload: param
        };
        return this.get(requestParam)
    }

    getObservationListMentor(mentorId){
        const requestParam = {
            url: API_END_POINTS.GET_OBSERVATION_LIST_OF_MENTOR(mentorId),
        };
        return this.get(requestParam)
    }
    secheduleObservation(params){
        const requestParam = {
            url: API_END_POINTS.ADD_SECHEDULE,
            payload: params
        };
        return this.post(requestParam)
    }

    getAllSechedules(mentorId){
        const requestParam = {
            url: API_END_POINTS.GET_ALL_SECHULDES(mentorId),
        };
        return this.get(requestParam)
    }

    getAllMenteSechedules(mentorId){
        const requestParam = {
            url: API_END_POINTS.GET_ALL_MENTE_SECHULDES(mentorId),
        };
        return this.get(requestParam)
    }

    getAllCompletedSechedules(menteeId){
        const requestParam = {
            url: API_END_POINTS.GET_ALL_COMPLETED_SCHEDULES(menteeId),
        }
        return this.get(requestParam)
    }
    getAttempsOfMentee(mentorId, menteeId){
        const requestParam = {
            url: API_END_POINTS.GET_ATTEMPS_OF_MENTEE(mentorId, menteeId),
        };
        return this.get(requestParam)
    }
    getAttempsOfObservations(mentorId, solutionId){
        const requestParam = {
            url: API_END_POINTS.GET_ATTEMPS_OF_OBSERVATION(mentorId, solutionId),
        };
        return this.get(requestParam)
    }

}
