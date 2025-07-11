import {Inject, Injectable} from '@angular/core';
import {
    CorrelationData,
    Rollup,
    TelemetryEndRequest,
    TelemetryErrorRequest,
    TelemetryImpressionRequest,
    TelemetryInteractRequest,
    TelemetryAuditRequest,
    TelemetryLogRequest,
    TelemetryObject,
    TelemetryService,
    TelemetryStartRequest,
    TelemetryInterruptRequest,
    DeviceSpecification,
    Actor,
    TelemetrySummaryRequest,
    ProducerData
} from 'sunbird-sdk';
import {Map} from '../app/telemetryutil';
import {
    Environment, ImpressionType, InteractSubtype, InteractType,
    Mode, PageId, CorReleationDataType, ID, ImpressionSubtype
} from './telemetry-constants';
import {MimeType} from '../app/app.constant';
import {ContentUtil} from '../util/content-util';
import {SbProgressLoader} from '../services/sb-progress-loader.service';
import { ConfigurationsService } from '../library/ws-widget/utils/src/public-api';

@Injectable()
export class TelemetryGeneratorService {
    constructor(
        @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
        private sbProgressLoader: SbProgressLoader,
        private configSvc: ConfigurationsService,
    ) {
    }

    generateAuditTelemetry(env, currentSate?, updatedProperties?, type?, objId?, objType?, objVer?, correlationData?, objRollup?) {
        const telemetryAuditRequest: TelemetryAuditRequest = {
            env: env ? env : undefined,
            currentState: currentSate ? currentSate : undefined,
            updatedProperties: updatedProperties ? updatedProperties : undefined,
            type: type ? type : undefined,
            objId: objId ? objId : undefined,
            objType: objType ? objType : undefined,
            objVer: objVer ? objVer : undefined,
            rollUp: objRollup || {},
            correlationData: correlationData ? correlationData : undefined,
            actor: new Actor()
        };
        this.telemetryService.audit(telemetryAuditRequest).subscribe();
    }

    generateInteractTelemetry(interactType, interactSubtype, env, pageId, object?: TelemetryObject, values?: Map,
                              rollup?: Rollup, corRelationList?: Array<CorrelationData>, id?: string) {
        const hash: string =
            JSON.stringify({ pageId: pageId || undefined });
        const userId = (values && values['UID']) ? values['UID'] : this.getUserId();
        if (
            Array.from(this.sbProgressLoader.contexts.entries()).some(([_, context]) => {
                if (context.ignoreTelemetry && context.ignoreTelemetry.when && context.ignoreTelemetry.when.interact) {
                    return !!hash.match(context.ignoreTelemetry.when.interact);
                }
                return false;
            })
        ) {
            return;
        }
        const actor = {
            id: userId || '', type: userId ? 'User' : 'Guest user'
        };

        const telemetryInteractRequest = new TelemetryInteractRequest();
        telemetryInteractRequest.type = interactType;
        telemetryInteractRequest.subType = interactSubtype;
        telemetryInteractRequest.pageId = pageId;
        telemetryInteractRequest.id = id ? id : pageId;
        telemetryInteractRequest.env = env;
        telemetryInteractRequest.actor = actor;
        if (values !== null) {
            telemetryInteractRequest.valueMap = values;
        }
        if (rollup !== undefined) {
            telemetryInteractRequest.rollup = rollup;
        }
        if (corRelationList !== undefined) {
            telemetryInteractRequest.correlationData = corRelationList;
        }

        if (object && object.id) {
            telemetryInteractRequest.objId = object.id;
        }

        if (object && object.type) {
            telemetryInteractRequest.objType = object.type;
        }

        if (object && object.version) {
            telemetryInteractRequest.objVer = object.version + '';
        }
        this.telemetryService.interact(telemetryInteractRequest).subscribe();
    }

    generateImpressionTelemetry(type, subtype, pageId, env, objectId?: string, objectType?: string,
                                objectVersion?: string, rollup?: Rollup, corRelationList?: Array<CorrelationData>) {
        const hash: string =
            JSON.stringify({ pageId: pageId || undefined });
        const userId = this.getUserId();
        if (
            Array.from(this.sbProgressLoader.contexts.entries()).some(([_, context]) => {
                if (context.ignoreTelemetry && context.ignoreTelemetry.when && context.ignoreTelemetry.when.impression) {
                    return !!hash.match(context.ignoreTelemetry.when.impression);
                }
                return false;
            })
        ) {
            return;
        }

        console.log("roles ", this.configSvc.userProfile)

        const telemetryImpressionRequest = new TelemetryImpressionRequest();
        telemetryImpressionRequest.actor = {
            id: userId || '', type: userId ? 'User' : 'Guest user'
        };
        telemetryImpressionRequest.type = type;
        telemetryImpressionRequest.subType = subtype;
        telemetryImpressionRequest.pageId = pageId || PageId.HOME;
        telemetryImpressionRequest.env = env;
        telemetryImpressionRequest.objId = objectId ? objectId : '';
        telemetryImpressionRequest.objType = objectType ? objectType : '';
        telemetryImpressionRequest.objVer = objectVersion ? objectVersion + '' : '';

        if (rollup !== undefined) {
            telemetryImpressionRequest.rollup = rollup;
        }
        if (corRelationList !== undefined) {
            telemetryImpressionRequest.correlationData = corRelationList;
        }
        this.telemetryService.impression(telemetryImpressionRequest).subscribe();
    }

    generateEndTelemetry(type, mode, pageId, env, duration?: number, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>) {
        const telemetryEndRequest = new TelemetryEndRequest();
        const userId = this.getUserId();
        telemetryEndRequest.type = type;
        telemetryEndRequest.pageId = pageId;
        telemetryEndRequest.env = env;
        telemetryEndRequest.mode = mode;
        telemetryEndRequest.duration = duration;
        telemetryEndRequest.actor = {
            id: userId || '', type: userId ? 'User' : 'Guest user'
        };
        if (object && object.id) {
            telemetryEndRequest.objId = object.id;
        }

        if (object && object.type) {
            telemetryEndRequest.objType = object.type;
        }

        if (object && object.version) {
            telemetryEndRequest.objVer = object.version + '';
        }
        if (rollup) {
            telemetryEndRequest.rollup = rollup;
        }
        if (corRelationList) {
            telemetryEndRequest.correlationData = corRelationList;
        }
        this.telemetryService.end(telemetryEndRequest).subscribe();
    }

    generateStartTelemetry(pageId, object?: TelemetryObject, rollup?: Rollup, corRelationList?: Array<CorrelationData>, status?) {
        const telemetryStartRequest = new TelemetryStartRequest();
        const userId = this.getUserId();
        telemetryStartRequest.type = object.type;
        if (pageId) {
            telemetryStartRequest.pageId = pageId;
            telemetryStartRequest.mode = status && status === "PAUSED" ? Mode.PAUSED : Mode.PLAY;
        }
        if (object && object.id) {
            telemetryStartRequest.objId = object.id;
        }

        if (object && object.type) {
            telemetryStartRequest.objType = object.type;
        }

        if (object && object.version) {
            telemetryStartRequest.objVer = object.version + '';
        }
        if (rollup !== undefined) {
            telemetryStartRequest.rollup = rollup;
        }
        if (corRelationList !== undefined) {
            telemetryStartRequest.correlationData = corRelationList;
        }
        telemetryStartRequest.actor = {
            id: userId || '', type: userId ? 'User' : 'Guest user'
        };

        this.telemetryService.start(telemetryStartRequest).subscribe();
    }

    generateSummaryTelemetry(type, starttime, endtime, timpespent,
                             pageviews, interactions, env, object?: TelemetryObject,
                             rollup?: Rollup, corRelationList?: Array<CorrelationData>) {
        const telemetrySummaryRequest = new TelemetrySummaryRequest();
        const userId = this.getUserId();
        telemetrySummaryRequest.type = type;
        telemetrySummaryRequest.starttime = starttime;
        telemetrySummaryRequest.endtime = endtime;
        telemetrySummaryRequest.timespent = timpespent;
        telemetrySummaryRequest.pageviews = pageviews;
        telemetrySummaryRequest.interactions = interactions;
        telemetrySummaryRequest.mode = Mode.PLAY;
        telemetrySummaryRequest.actor = {
            id: userId || '', type: userId ? 'User' : 'Guest user'
        };
        if (object && object.id) {
            telemetrySummaryRequest.objId = object.id;
        }

        if (object && object.type) {
            telemetrySummaryRequest.objType = object.type;
        }

        if (object && object.version) {
            telemetrySummaryRequest.objVer = object.version + '';
        }
        if (rollup !== undefined) {
            telemetrySummaryRequest.rollup = rollup;
        }
        if (corRelationList !== undefined) {
            telemetrySummaryRequest.correlationData = corRelationList;
        }
        this.telemetryService.summary(telemetrySummaryRequest).subscribe();
    }

    generateLogEvent(logLevel, message, env, type, params: Array<any>) {
        const telemetryLogRequest = new TelemetryLogRequest();
        telemetryLogRequest.level = logLevel;
        telemetryLogRequest.message = message;
        telemetryLogRequest.env = env;
        telemetryLogRequest.type = type;
        telemetryLogRequest.params = params;
        this.telemetryService.log(telemetryLogRequest).subscribe();
    }

    genererateAppStartTelemetry(deviceSpec: DeviceSpecification) {
        const telemetryStartRequest = new TelemetryStartRequest();
        telemetryStartRequest.type = 'app';
        telemetryStartRequest.env = 'home';
        telemetryStartRequest.deviceSpecification = deviceSpec;
        this.telemetryService.start(telemetryStartRequest).subscribe();
    }

    generateInterruptTelemetry(type, pageId) {
        const telemetryInterruptRequest = new TelemetryInterruptRequest();
        const userId = this.getUserId();
        const actor = {
            id: userId || '', type: userId ? 'User' : 'Guest user'
        };
        telemetryInterruptRequest.actor = actor;
        telemetryInterruptRequest.pageId = pageId;
        telemetryInterruptRequest.type = type;
        this.telemetryService.interrupt(telemetryInterruptRequest).subscribe();
    }

    generateErrorTelemetry(env, errCode, errorType, pageId, stackTrace) {
        const telemetryErrorRequest = new TelemetryErrorRequest();
        const userId = this.getUserId();
        const actor = {
            id: userId || '', type: userId ? 'User' : 'Guest user'
        };
        telemetryErrorRequest.actor = actor;
        telemetryErrorRequest.errorCode = errCode;
        telemetryErrorRequest.errorType = errorType;
        telemetryErrorRequest.pageId = pageId;
        telemetryErrorRequest.stacktrace = stackTrace;
        this.telemetryService.error(telemetryErrorRequest).subscribe();
    }

    generateBackClickedTelemetry(pageId, env, isNavBack: boolean, identifier?: string, corRelationList?, objRollup?, telemetryObject?) {
        const values = new Map();
        if (identifier) {
            values['identifier'] = identifier;
        }
        this.generateInteractTelemetry(
            InteractType.TOUCH,
            isNavBack ? InteractSubtype.NAV_BACK_CLICKED : InteractSubtype.DEVICE_BACK_CLICKED,
            env,
            pageId,
            telemetryObject,
            values,
            objRollup,
            corRelationList);
    }

    generatePageViewTelemetry(pageId, env, subType?) {
        this.generateImpressionTelemetry(ImpressionType.VIEW, subType ? subType : '',
            pageId,
            env);
    }

    generateSpineLoadingTelemetry(content: any, isFirstTime) {
        const values = new Map();
        values['isFirstTime'] = isFirstTime;
        values['size'] = content.size;
        const telemetryObject = ContentUtil.getTelemetryObject(content);
        this.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.LOADING_SPINE,
            Environment.HOME,
            PageId.DOWNLOAD_SPINE,
            telemetryObject,
            values,
            ContentUtil.generateRollUp(undefined, telemetryObject.id));
    }

    generateCancelDownloadTelemetry(content: any) {
        const values = new Map();
        this.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.CANCEL_CLICKED,
            Environment.HOME,
            PageId.DOWNLOAD_SPINE,
            ContentUtil.getTelemetryObject(content),
            values);
    }

    generateDownloadAllClickTelemetry(pageId, content, downloadingIdentifier, childrenCount, rollup?, corelationList?) {
        const values = new Map();
        values['downloadingIdentifers'] = downloadingIdentifier;
        values['childrenCount'] = childrenCount;
        this.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.DOWNLOAD_ALL_CLICKED,
            Environment.HOME,
            pageId,
            ContentUtil.getTelemetryObject(content),
            values,
            rollup, corelationList);
    }

    generatePullToRefreshTelemetry(pageId, env) {
        this.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.PULL_TO_REFRESH,
            env,
            pageId
        );
    }

    /**
     * method generates telemetry on click Read less or Read more
     * @param string param string as read less or read more
     * @param object objRollup object roll up
     * @param corRelationList corelationList
     */
    readLessOrReadMore(param, objRollup, corRelationList, telemetryObject) {
        this.generateInteractTelemetry(InteractType.TOUCH,
            param = 'READ_MORE' === param ? InteractSubtype.READ_MORE_CLICKED : InteractSubtype.READ_LESS_CLICKED,
            Environment.HOME,
            PageId.COLLECTION_DETAIL,
            undefined,
            telemetryObject,
            objRollup,
            corRelationList);
    }

    generateProfilePopulatedTelemetry(pageId, profile, mode, env?, source?) {
        const values = new Map();
        values['board'] = profile.board[0];
        values['medium'] = profile.medium;
        values['grade'] = profile.grade;
        values['mode'] = mode;
        const corRelationList: Array<CorrelationData> = [];
        corRelationList.push({ id: profile.board ? profile.board.join(',') : '', type: CorReleationDataType.BOARD });
        corRelationList.push({ id: profile.medium ? profile.medium.join(',') : '' , type: CorReleationDataType.MEDIUM });
        corRelationList.push({ id: profile.grade ? profile.grade.join(',') : '', type: CorReleationDataType.CLASS });
        corRelationList.push({ id: profile.profileType, type: CorReleationDataType.USERTYPE });
        if (source) {
            corRelationList.push({id: source, type: CorReleationDataType.SOURCE});
        }
        this.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.PROFILE_ATTRIBUTE_POPULATION,
            env ? env : Environment.HOME,
            pageId,
            undefined,
            values, undefined,
            corRelationList);
    }

    generateAppLaunchTelemetry(type: string, source?: string) {
        const corRelationList: Array<CorrelationData> = [{
            id: ContentUtil.extractBaseUrl(source),
            type: CorReleationDataType.SOURCE
          }];
        this.generateInteractTelemetry(
            type,
            '',
            Environment.HOME,
            Environment.HOME,
            undefined,
            { source },
            undefined,
            corRelationList,
            ID.APP_LAUNCH);
    }

    generateExtraInfoTelemetry(values: Map, pageId) {
        this.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.EXTRA_INFO,
            Environment.HOME,
            pageId,
            undefined,
            values);
    }

    generateContentCancelClickedTelemetry(content: any, downloadProgress) {
        const values = new Map();
        values['size'] = this.transform(content.size);
        if (content.size && downloadProgress) {
            const kbsofar = (content.size / 100) * Number(downloadProgress);
            values['downloadedSoFar'] = this.transform(kbsofar);
        }
        this.generateInteractTelemetry(
            InteractType.TOUCH,
            InteractSubtype.CANCEL_CLICKED,
            Environment.HOME,
            PageId.CONTENT_DETAIL,
            ContentUtil.getTelemetryObject(content),
            values);
    }

    transform(size: any, roundOf: number = 2) {
        if (size || size === 0) {
            if (isNaN(size)) {
                size = 0;
            }
            size /= 1024;
            if (size < 1024) {
                return size.toFixed(roundOf) + ' KB';
            }
            size /= 1024;
            if (size < 1024) {
                return size.toFixed(roundOf) + ' MB';
            }
            size /= 1024;
            if (size < 1024) {
                return size.toFixed(roundOf) + ' GB';
            }
            size /= 1024;
            return size.toFixed(roundOf) + ' TB';
        } else {
            return '0 KB';
        }
    }

    isCollection(mimeType) {
        return mimeType === MimeType.COLLECTION;
    }

    generateUtmInfoTelemetry(values: Map, pageId, object?: TelemetryObject, corRelationData?) {
        this.generateInteractTelemetry(
            InteractType.OTHER,
            InteractSubtype.UTM_INFO,
            Environment.HOME,
            pageId,
            object,
            values,
            undefined,
            corRelationData);
    }

    /* Fast loading telemetry generator */
    generatefastLoadingTelemetry(interactSubtype, pageId, telemetryObject?, objRollup?, value?, corRelationList?) {
        this.generateInteractTelemetry(
            InteractType.OTHER,
            interactSubtype,
            Environment.HOME,
            pageId,
            telemetryObject,
            value,
            objRollup,
            corRelationList
        );
    }

    generateNotificationClickedTelemetry(type, pageId, value?, corRelationList?) {
        this.generateInteractTelemetry(
            type,
            '',
            Environment.HOME,
            pageId,
            undefined,
            value,
            undefined,
            corRelationList,
            ID.NOTIFICATION_CLICKED
        );
    }


    /* New Telemetry */
    generateBackClickedNewTelemetry(isDeviceBack, env, pageId, duration?) {
        const values = new Map();
        values['duration'] = duration
        this.generateInteractTelemetry(
            InteractType.SELECT_BACK,
            isDeviceBack ? InteractSubtype.DEVICE : InteractSubtype.UI,
            env,
            pageId,
            undefined,
            values
        );
    }

    generatePageLoadedTelemetry(pageId, env, objId?, objType?, objversion?, rollup?, correlationList?) {
        this.generateImpressionTelemetry(
            ImpressionType.PAGE_LOADED,
            pageId === PageId.LOCATION ? ImpressionSubtype.AUTO : '',
            pageId,
            env,
            objId,
            objType,
            objversion,
            rollup,
            correlationList
        );
    }

    generateNewExprienceSwitchTelemetry(pageId, subType, corRelationInfo) {
        const corRelationList: Array<CorrelationData> = [];
        corRelationList.push({
            type: CorReleationDataType.FIRST_TIME_USER,
            id: corRelationInfo['isNewUser'] + ''
        });
        corRelationList.push({
            type: CorReleationDataType.USERTYPE,
            id:  corRelationInfo['userType']
        });
        this.generateInteractTelemetry(
            InteractType.NEW_EXPERIENCE,
            subType,
            Environment.HOME,
            pageId,
            undefined,
            undefined,
            undefined,
            corRelationList,
            ID.SWITCH_CLICKED
          );
    }

    getUserId() {
        if (this.configSvc?.userProfile?.userId) {
            return this.configSvc?.userProfile?.userId
        }
        const user = localStorage.getItem('competency')
        return user ? JSON.parse(user).id : ''
    }
}
