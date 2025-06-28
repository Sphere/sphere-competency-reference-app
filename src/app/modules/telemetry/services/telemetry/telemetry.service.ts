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
    TelemetrySummaryRequest
} from 'sunbird-sdk';
import { Map } from '../../../../../app/telemetryutil';
import {
    Environment, ImpressionType, InteractSubtype, InteractType,
    Mode, PageId, CorReleationDataType, ID, ImpressionSubtype,IImpressionEventInput, IStartEventInput, IEndEventInput
} from '../../../../../services/telemetry-constants';

import { MimeType } from '../../../../../app/app.constant';
import {ContentUtil} from '../../../../../util/content-util';
import { SbProgressLoader } from '../../../../../services';

@Injectable()
export class TelemetryGeneratorService {
    constructor(
        @Inject('TELEMETRY_SERVICE') private telemetryService: TelemetryService,
        private sbProgressLoader: SbProgressLoader,
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

    generateInteractTelemetry(interactType ?:any, interactSubtype?:any, env?:any, pageId?:any, object?: TelemetryObject, values?: Map,
                              rollup?: Rollup, corRelationList?: Array<CorrelationData>, id?: string) {
        const hash: string =
            JSON.stringify({ pageId: pageId || undefined });
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

        const telemetryInteractRequest = new TelemetryInteractRequest();
        telemetryInteractRequest.type = interactType;
        telemetryInteractRequest.subType = interactSubtype;
        telemetryInteractRequest.pageId = pageId;
        telemetryInteractRequest.id = id ? id : pageId;
        telemetryInteractRequest.env = env;
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

    generateImpressionTelemetry(impressionEventInput: IImpressionEventInput) {
        const hash: string =
            JSON.stringify({ pageId: impressionEventInput.pageId || undefined });
    
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
    
        const telemetryImpressionRequest = new TelemetryImpressionRequest();
        telemetryImpressionRequest.type = impressionEventInput.type;
        telemetryImpressionRequest.subType = impressionEventInput.subtype;
        telemetryImpressionRequest.pageId = impressionEventInput.pageId || PageId.HOME;
        telemetryImpressionRequest.env = impressionEventInput.env;
        telemetryImpressionRequest.objId = impressionEventInput.objectId ? impressionEventInput.objectId : '';
        telemetryImpressionRequest.objType = impressionEventInput.objectType ? impressionEventInput.objectType : '';
        telemetryImpressionRequest.objVer = impressionEventInput.objectVersion ? impressionEventInput.objectVersion + '' : '';
    
        if (impressionEventInput.rollup !== undefined) {
            telemetryImpressionRequest.rollup = impressionEventInput.rollup;
        }
        if (impressionEventInput.corRelationList !== undefined) {
            telemetryImpressionRequest.correlationData = impressionEventInput.corRelationList;
        }
    
        this.telemetryService.impression(telemetryImpressionRequest).subscribe();
    }

    generateEndTelemetry(endEventInput: IEndEventInput) {
        const telemetryEndRequest = new TelemetryEndRequest();
        telemetryEndRequest.type = endEventInput.type;
        telemetryEndRequest.pageId = endEventInput.pageId;
        telemetryEndRequest.env = endEventInput.env;
        telemetryEndRequest.mode = endEventInput.mode;
    
        if (endEventInput.object && endEventInput.object.id) {
            telemetryEndRequest.objId = endEventInput.object.id;
        }
    
        if (endEventInput.object && endEventInput.object.type) {
            telemetryEndRequest.objType = endEventInput.object.type;
        }
    
        if (endEventInput.object && endEventInput.object.version) {
            telemetryEndRequest.objVer = endEventInput.object.version + '';
        }
    
        if (endEventInput.rollup) {
            telemetryEndRequest.rollup = endEventInput.rollup;
        }
    
        if (endEventInput.corRelationList) {
            telemetryEndRequest.correlationData = endEventInput.corRelationList;
        }
    
        this.telemetryService.end(telemetryEndRequest).subscribe();
    }

    generateStartTelemetry(startEventInput: IStartEventInput) {
        const telemetryStartRequest = new TelemetryStartRequest();
        telemetryStartRequest.type = startEventInput.object?.type || 'defaultType';
        telemetryStartRequest.pageId = startEventInput.pageId;
        telemetryStartRequest.duration = startEventInput.duration
        telemetryStartRequest.mode = Mode.PLAY;
    
        if (startEventInput.object && startEventInput.object.id) {
            telemetryStartRequest.objId = startEventInput.object.id;
        }
    
        if (startEventInput.object && startEventInput.object.type) {
            telemetryStartRequest.objType = startEventInput.object.type;
        }
    
        if (startEventInput.object && startEventInput.object.version) {
            telemetryStartRequest.objVer = startEventInput.object.version + '';
        }
    
        if (startEventInput.rollup !== undefined) {
            telemetryStartRequest.rollup = startEventInput.rollup;
        }
    
        if (startEventInput.corRelationList !== undefined) {
            telemetryStartRequest.correlationData = startEventInput.corRelationList;
        }
    
        this.telemetryService.start(telemetryStartRequest).subscribe();
    }
    

    generateSummaryTelemetry(type, starttime, endtime, timpespent,
                             pageviews, interactions, env, object?: TelemetryObject,
                             rollup?: Rollup, corRelationList?: Array<CorrelationData>) {
        const telemetrySummaryRequest = new TelemetrySummaryRequest();
        telemetrySummaryRequest.type = type;
        telemetrySummaryRequest.starttime = starttime;
        telemetrySummaryRequest.endtime = endtime;
        telemetrySummaryRequest.timespent = timpespent;
        telemetrySummaryRequest.pageviews = pageviews;
        telemetrySummaryRequest.interactions = interactions;
        telemetrySummaryRequest.mode = Mode.PLAY;
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
        telemetryInterruptRequest.pageId = pageId;
        telemetryInterruptRequest.type = type;
        this.telemetryService.interrupt(telemetryInterruptRequest).subscribe();
    }

    generateErrorTelemetry(env ?:any, errCode?:any, errorType ?:any, pageId?:any, stackTrace?:any) {
        const telemetryErrorRequest = new TelemetryErrorRequest();
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

    generatePageViewTelemetry(pageId: string, env: any, subType?: any) {
        const impressionEventInput: IImpressionEventInput = {
            type: ImpressionType.VIEW,
            subtype: subType ? subType : '',
            pageId: pageId,
            env: env
        };
    
        this.generateImpressionTelemetry(impressionEventInput);
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
    generateBackClickedNewTelemetry(isDeviceBack, env, pageId) {
        this.generateInteractTelemetry(
            InteractType.SELECT_BACK,
            isDeviceBack ? InteractSubtype.DEVICE : InteractSubtype.UI,
            env,
            pageId
        );
    }

    generatePageLoadedTelemetry(pageId: string, env: any, objId?: string, objType?: string, objVersion?: string, rollup?: Rollup, correlationList?: Array<CorrelationData>) {
        const impressionEventInput: IImpressionEventInput = {
            type: ImpressionType.PAGE_LOADED,
            subtype: pageId === PageId.LOCATION ? ImpressionSubtype.AUTO : '',
            pageId: pageId,
            env: env,
            objectId: objId ? objId : '',
            objectType: objType ? objType : '',
            objectVersion: objVersion ? objVersion : '',
            rollup: rollup,
            corRelationList: correlationList
        };
        this.generateImpressionTelemetry(impressionEventInput);
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
}
