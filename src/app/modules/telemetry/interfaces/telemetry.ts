export interface IUserProfile  {

}

export interface IStartEventData {
  'type': string;
  'pageid': string;
  'mode': string;
  'dspec'?: {};
  'uaspec'?: {};
  'loc'?: string;
  'duration'?: Number;
}
export interface IImpressionEventData {
  'type': string;
  'subtype'?: string;
  'pageid': string;
  'uri': string;
  'duration'?: Number;
  'visits'?: Array<IImpressionEventVisits>;
}
export interface IImpressionEventVisits {
  objid: string;
  objtype: string;
  objver?: string;
  section?: string;
  index: string | number;
}
export interface IInteractEventEdata {
  'id': string;
  'type': string;
  'subtype'?: string;
  'pageid'?: string;
  'extra'?: {};
  'target'?: string;
  'plugin'?: string;
}

export interface IAuditEventEData {
  'props': string[];
  'state': string;
  'prevstate': string;
  'type'?: string;
}
export interface IShareEventData {
  'type': string;
  'dir': string;
  'items': Array<{}>;
}
export interface IErrorEventData {
  'err': string;
  'errtype': string;
  'stacktrace': string;
}
export interface IEndEventData {
  'pageid'?: string;
  'duration'?: string;
  'type': string;
  'mode'?: string;
  'summary'?: Array<{}>;
}
export interface ILogEventData {
  'type': string;
  'level': string;
  'message'?: string;
  'pageid'?: string;
  'params'?: Array<{}>;
}
export interface IExDataEventData {
  'type': string;
  'data': string;
}

export interface IFeedBackEventData {
  'commentid'?: string;
  'commenttxt'?: string;
  'rating'?: number;
}
export interface ITelemetryContextData {
  'channel': string;
  'uid': string;
  'env': string;
  'pdata'?: {};
  'sid'?: string;
  'did'?: string;
  'cdata'?: Array<{}>;
  'rollup'?: {};
}
export interface TelemetryObject {
  'id': string;
  'type': string;
  'ver'?: string;
  'rollup': {};
}
export interface TelemetryEventOptions {
  'context'?: ITelemetryContextData;
  'object'?: TelemetryObject | any;
  'tags'?: Array<string>;
}
export interface ITelemetryEvent {
  'edata': IStartEventData | IImpressionEventData | IInteractEventEdata | IShareEventData
  | IErrorEventData | IEndEventData | ILogEventData | IFeedBackEventData;
  'contentId'?: string;
  'contentVer'?: string;
  'options': TelemetryEventOptions;
}

export interface IEndEventInput {
  'context': {
    'env': string;
    'cdata'?: Array<object>;
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'rollup'?: {};
  };
  'edata': IEndEventData;
}

export interface IErrorEventInput {
  'context': {
    'env': string;
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'rollup'?: {};
  };
  'edata': IErrorEventData;
}

export interface IImpressionEventInput {
  'context': {
    'env': string;
    'cdata'?: Array<object>;
    'pdata'?: IProducerData
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'section'?: string;
    'rollup'?: {};
  };
  'edata': IImpressionEventData;
}
export interface IInteractEventInput {
  'context': {
    'env': string;
    'cdata': Array<object>,
    'pdata'?: IProducerData
  };
  'object'?: IInteractEventObject;
  'edata': IInteractEventEdata;
}
export interface IInteractEventObject {
  'id'?: string;
  'type'?: string;
  'ver'?: string;
  'rollup'?: {};
}

export interface IAuditEventInput {
  'context': {
    'env': string;
    'cdata': Array<object>;
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'rollup'?: {};
  };
  'edata': IAuditEventEData;
}
export interface ILogEventInput {
  'context': {
    'env': string;
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'rollup'?: {};
  };
  'edata': ILogEventData;
}

export interface IExDataEventInput {
  'context': {
    'env': string;
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'rollup'?: {};
  };
  'edata': IExDataEventData;
}
export interface IFeedBackEventInput {
  'context': {
    'env': string;
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'rollup'?: {};
  };
  'edata': IFeedBackEventData;
}
export interface IShareEventInput {
  'context': {
    'env': string;
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'rollup'?: {};
  };
  'edata': IShareEventData;
}

export interface IStartEventInput {
  'context': {
    'env': string;
    'cdata'?: Array<{}>;
  };
  'object'?: {
    'id': string;
    'type': string;
    'ver'?: string;
    'rollup'?: {};
  };
  'edata': IStartEventData;
}

export interface IProducerData {
  'id': string;
  'ver': string;
  'pid': string;
}

export interface ITelemetry {
  'pdata': IProducerData;
  'env': string;
  'apislug': string;
  'channel': string;
  'uid'?: string;
  'endpoint': string;
  'did'?: string;
  'authtoken'?: string;
  'sid'?: string;
  'batchsize'?: Number;
  'runningEnv'?: string;
  'mode'?: string;
  'host'?: string;
  'tags'?: Array<string>;
  'cdata'?: Array<{}>;
  'dispatcher'?: undefined;
  'enableValidation': boolean;
  'timeDiff'?: Number;
}

export interface ITelemetryContext {
  'config': ITelemetry;
  'userOrgDetails': any;
}
