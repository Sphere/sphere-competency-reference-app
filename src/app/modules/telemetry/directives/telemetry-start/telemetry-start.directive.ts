import { Directive, Input, OnChanges } from '@angular/core';
import { IStartEventInput } from '../../interfaces';
import { TelemetryGeneratorService as TelemetryService } from '../../services';

/**
 * TelemetryInteract Directive
 */
@Directive({
  selector: '[appTelemetryStart]'
})
export class TelemetryStartDirective implements OnChanges {
  /**
   * Interact event input
  */
  @Input() appTelemetryStart: any;
  /**
   * reference of permissionService service.
  */
  public telemetryService: TelemetryService;

  public eventTriggered = false;
  /**
  * Constructor to create injected service(s) object
  Default method of Draft Component class
  * @param {TelemetryService} telemetryService Reference of TelemetryService
  */
  constructor(telemetryService: TelemetryService) {
    this.telemetryService = telemetryService;
  }
  ngOnChanges() {
    if (this.appTelemetryStart && !this.eventTriggered) {
      this.eventTriggered = true;
      this.telemetryService.generateStartTelemetry(this.appTelemetryStart);
    }
  }
}
