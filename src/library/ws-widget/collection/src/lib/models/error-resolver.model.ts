import { IWidgetErrorAccessForbidden } from './error-access-forbidden.model'
import { IWidgetErrorContentUnavailable } from './error-content-unavailable.model'
import { IWidgetErrorFeatureDisabled } from './error-feature-disabled.model'
import { IWidgetErrorFeatureUnavailable } from './error-feature-unavailable.model'
import { IWidgetErrorInternalServer } from './error-internal-server.model'
import { IWidgetErrorNotFound } from './error-not-found.model'
import { IWidgetErrorServiceUnavailable } from './error-service-unavailable.model'
import { IWidgetErrorSomethingsWrong } from './error-something-wrong.model'

export namespace NsError {
  export type TErrorType =
    | 'accessForbidden'
    | 'contentUnavailable'
    | 'featureDisabled'
    | 'featureUnavailable'
    | 'internalServer'
    | 'notFound'
    | 'serviceUnavailable'
    | 'somethingsWrong'

  export interface IErrorConfig {
    accessForbidden: IWidgetErrorAccessForbidden
    contentUnavailable: IWidgetErrorContentUnavailable
    featureDisabled: IWidgetErrorFeatureDisabled
    featureUnavailable: IWidgetErrorFeatureUnavailable
    internalServer: IWidgetErrorInternalServer
    notFound: IWidgetErrorNotFound
    serviceUnavailable: IWidgetErrorServiceUnavailable
    somethingsWrong: IWidgetErrorSomethingsWrong
  }

  export type TAllErrorConfig =
    | IWidgetErrorAccessForbidden
    | IWidgetErrorContentUnavailable
    | IWidgetErrorFeatureDisabled
    | IWidgetErrorFeatureUnavailable
    | IWidgetErrorInternalServer
    | IWidgetErrorNotFound
    | IWidgetErrorServiceUnavailable
    | IWidgetErrorSomethingsWrong

  export interface IWidgetErrorResolver {
    errorType: TErrorType
    errorData?: TAllErrorConfig
    errorDataPath?: string
  }
}
