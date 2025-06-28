import { Component, OnInit, Inject } from '@angular/core'
import { NsGoal } from '../btn-goals.model'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TFetchStatus } from 'library/ws-widget/utils/src/lib/constants/misc.constants';

@Component({
  selector: 'ws-widget-btn-goals-dialog',
  templateUrl: './btn-goals-dialog.component.html',
  styleUrls: ['./btn-goals-dialog.component.scss'],
})
export class BtnGoalsDialogComponent implements OnInit {
  fetchGoals: TFetchStatus = 'none'
  goals: NsGoal.IUserGoals | null = null

  constructor(
    public dialogRef: MatDialogRef<BtnGoalsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {}
}
