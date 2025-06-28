import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonUtilService } from '../../../../../../../../../services';
@Component({
  selector: 'app-user-whatsapp-modal',
  templateUrl: './user-whatsapp-modal.component.html',
  styleUrls: ['./user-whatsapp-modal.component.scss'],
})
export class UserWhatsappModalComponent implements OnInit {
  freeSpace:any
  courseSize:any
  constructor(
    public dialogRef: MatDialogRef<UserWhatsappModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private commonUtilService: CommonUtilService,
  ) { 
   
  }

  ngOnInit() {
    
  }

  ignoreWhatsAppOptIn() {
    this.dialogRef.close({'is_opted_in': false})
  }
  enableWhatsAppOptIn() {
    this.commonUtilService.addLoader()
    this.dialogRef.close({ 'is_opted_in': true })
  }
  noWhatsUp(){
    this.dialogRef.close()
    this.dialogRef.close({'is_opted_in': false})
  }
}
