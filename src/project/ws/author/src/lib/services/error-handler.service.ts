import { ErrorHandler, Injectable } from '@angular/core'
import { LoaderService } from './loader.service'
import { LoggerService } from '../../../../../../library/ws-widget/utils/src/lib/services/logger.service'

@Injectable()
export class AuthoringErrorHandler implements ErrorHandler {

  constructor(
    private loaderService: LoaderService,
    private loggerService: LoggerService,
  ) { }

  handleError(error: any) {
    this.loaderService.changeLoad.next(false)
    this.loggerService.error(error)
  }
}
