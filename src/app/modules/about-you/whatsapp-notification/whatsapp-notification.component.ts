import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppTocService } from '../../../../project/ws/app/src/lib/routes/app-toc/services/app-toc.service';
import { AppFrameworkDetectorService } from '../../core/services/app-framework-detector-service.service';
import { catchError, first, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConfigurationsService } from '@ws-widget/utils';

@Component({
  selector: 'app-whatsapp-notification',
  templateUrl: './whatsapp-notification.component.html',
  styleUrls: ['./whatsapp-notification.component.scss']
})
export class WhatsappNotificationComponent implements OnInit {
  notificationForm!: FormGroup;
  @Output() redirectToParent = new EventEmitter();
  phoneNumber: any;
  appFramework: string;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private tocSvc: AppTocService,
    private appFrameworkDetectorService: AppFrameworkDetectorService,
    public configSvc: ConfigurationsService
  ) {}

  async ngOnInit() {
    this.initializeForm();
    await this.detectFramework();
  }

  async detectFramework() {
    try {
      this.appFramework = await this.appFrameworkDetectorService.detectAppFramework();
    } catch (error) {
      // console.log('error while getting packagename')
    }
  }

  initializeForm() {
    this.notificationForm = this.fb.group({
      preference: [null, [Validators.required]]
    });
  }

  preferenceValidator(control: AbstractControl) {
    // Accept boolean values and string values that represent booleans
    if (typeof control.value === 'boolean') {
      return null;
    } else if (control.value === 'true' || control.value === 'false') {
      return null;
    }
    return { required: true };
  }

  onSubmit() {
    if (!this.notificationForm.valid) return;
    
    // Convert preference to boolean if it's a string
    let preference = this.notificationForm.value.preference;
    if (preference === 'true') {
      preference = true;
    } else if (preference === 'false') {
      preference = false;
    }
    
    const req = {
      is_opted_in: preference,
      opt_in_channel: this.appFramework
    };
    
    console.log('req', req);
    
    this.tocSvc.updateUserWhatsAppOptInStatus(req).pipe(
      tap(() => console.log('Form Submitted:', this.notificationForm.value)),
      switchMap(() => this.activateRoute.queryParams.pipe(first())),
      tap(params => {
        const url = params.redirect || 'page/home';
        localStorage.removeItem('url_before_login');
        this.router.navigate([url]);
      }),
      catchError(err => {
        console.error('API error:', err);
        return of(null);
      })
    ).subscribe();
  }

  redirectToAlmostDone() {
    localStorage.removeItem('url_before_login');
    this.router.navigate(['/page/home'])
    //this.redirectToParent.emit(true);
  }
}