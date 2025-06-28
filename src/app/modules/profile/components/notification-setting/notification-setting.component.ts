import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonUtilService } from '../../../../../services';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/public-api';
import { AppFrameworkDetectorService } from '../../../core/services/app-framework-detector-service.service';
import { AppTocService } from '../../../../../project/ws/app/src/lib/routes/app-toc/services/app-toc.service';
import { filter, map, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';
import { Subject, from, of } from 'rxjs';

@Component({
  selector: 'app-notification-setting',
  templateUrl: './notification-setting.component.html',
  styleUrls: ['./notification-setting.component.scss'],
})
export class NotificationSettingComponent implements OnInit, OnDestroy {
  showbackButton = true;
  showLogOutIcon = false;
  trigerrNavigation = true;
  notificationForm: FormGroup;
  appFramework: any;
  isLoading = false;
  
  /* Subject for cleanup on component destruction */
  private destroy$ = new Subject<void>();
  private initialOptInStatus: boolean | null = null;

  constructor(
    public commonUtilService: CommonUtilService,
    private fb: FormBuilder,
    public configSvc: ConfigurationsService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    private tocSvc: AppTocService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    /*Clean up subscriptions */
    this.destroy$.next();
    this.destroy$.complete();
  }

  onWhatsAppToggleChange(event: any): void {
    const isChecked = event.detail.checked;
    console.log('Toggle manually changed to:', isChecked);
    /* Update form value without triggering valueChanges */
    this.notificationForm.get('whatsappToggle')?.setValue(isChecked, { emitEvent: false });
    this.updateWhatsAppStatus(isChecked);
  }

  private initializeForm(): void {
    // Initialize form first
    this.notificationForm = this.fb.group({
      whatsappToggle: [false]
    });
    
    // Chain async operations using RxJS
    from(this.appFrameworkDetectorService.detectAppFramework())
      .pipe(
        tap(framework => {
          console.log('App framework detected:', framework);
          this.appFramework = framework;
        }),
        switchMap(() => this.fetchCurrentWhatsAppStatus()),
        takeUntil(this.destroy$),
        catchError(error => {
          
          if(error.status === 404) {
            return of({ is_opted_in: false });
          }
          console.error('Error during initialization:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (initialStatus) => {
          if (initialStatus !== null) {
            // Update form with initial status if available
            this.notificationForm.get('whatsappToggle')?.setValue(initialStatus.is_opted_in, { emitEvent: false });
            this.initialOptInStatus = initialStatus.is_opted_in;
          }
          console.log('Component initialized successfully');
          this.setupFormListeners();
        }
      });
  }

  private setupFormListeners(): void {
    // Listen for programmatic changes to the form
    this.notificationForm.get('whatsappToggle')?.valueChanges
      .pipe(
        tap(value => console.log('Form value changed to:', value)),
        filter(() => {
          const isValid = this.notificationForm.valid;
          if (!isValid) {
            console.log('Form is invalid, skipping update');
          }
          return isValid && !this.isLoading;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(isEnabled => this.updateWhatsAppStatus(isEnabled));
  }

  private updateWhatsAppStatus(isEnabled: boolean): void {
    this.isLoading = true;
    
    const request = {
      is_opted_in: isEnabled,
      opt_in_channel: this.appFramework
    };
    
    console.log('Sending WhatsApp status update request:', request);
    
    this.tocSvc.updateUserWhatsAppOptInStatus(request)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to update WhatsApp status:', error);
          /* Revert the toggle on error */
          this.notificationForm.get('whatsappToggle')?.setValue(!isEnabled, { emitEvent: false });
          /*Show error message to user*/
          this.commonUtilService.showToast('Failed to update notification preference');
          return of(null);
        }),
        tap(() => this.isLoading = false)
      )
      .subscribe(response => {
        if (response) {
          console.log('WhatsApp status updated successfully:', response);
          // Show success message if needed
          if (isEnabled !== this.initialOptInStatus) {
            this.commonUtilService.showToast('Notification preference updated');
          }
          // ✅ Update the saved state for next toggle
          this.initialOptInStatus = isEnabled;
        }
      });
  }

  private fetchCurrentWhatsAppStatus() {
    return this.tocSvc.getUserWhatsAppContent()
  }
}