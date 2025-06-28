import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '../../../../../app/app.constant';
import { ObservationService } from '../../services/observation.service';
import { ObservationModalComponent } from '../observation-modal/observation-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-observation-results',
  templateUrl: './observation-results.component.html',
  styleUrls: ['./observation-results.component.scss'],
})
export class ObservationResultsComponent implements OnInit {

  public observationDetails: any;
  public observationData: any;
  public pointsBasedPercentageScore: any;
  public isAPIInprogress = true;
  public canSubmit = false;

  constructor(
    public router: Router,
    public userObserSvc: ObservationService,
    private dialog: MatDialog
  ) {
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation && currentNavigation.extras) {
      if (currentNavigation.extras.state?.observationDetails && currentNavigation.extras.state?.canSubmit){
        this.canSubmit = currentNavigation.extras.state?.canSubmit;
      }else{
        this.canSubmit = false;
      }
      if (currentNavigation.extras.state?.observationDetails && currentNavigation.extras.state?.observationData) {
        this.observationDetails = currentNavigation.extras.state?.observationDetails;
        this.observationData = currentNavigation.extras.state?.observationData;
        if(this.canSubmit){
          setTimeout(() => {
            this.getSubmissionResult();
          }, 3000);
        }else{
          this.pointsBasedPercentageScore = this.observationData.result_percentage || 0;
          this.isAPIInprogress = false;
        }
      } else {
        this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`]);
      }
    } else {
      this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`]);
    }
  }

  ngOnInit() { }


  continue() {
    this.router.navigate(['page/home'])
    // this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`]);
  }

  result() {
    const dialogRef = this.dialog.open(ObservationModalComponent, {
      width: '100%',
      height: '100%',
      data: {
        type: 'result',
        pointsBasedPercentageScore: this.pointsBasedPercentageScore
      },
      panelClass: 'result-observation'
    });
  }

  getSubmissionResult() {
    let param = {
      submission_id: this.observationDetails.assessment.submissionId
    }
    this.userObserSvc.getObservationSubmissionResult(param).subscribe((_result) => {
      if (_result.data && _result.data.result && _result.data.result.length > 0) {
        let res = _result.data.result[0];
        this.pointsBasedPercentageScore = res.pointsBasedPercentageScore;
        // TODO: Future refrence
        // "pointsBasedMaxScore": 1100,
        // "pointsBasedScoreAchieved": 380,
        // "pointsBasedPercentageScore": 34.54545454545455,
        if(this.canSubmit){
          if (res.pointsBasedPercentageScore > 60) {
            this.updateSubmissionandCompetency(true);
          } else {
            this.updateSubmissionandCompetency(false);
          }
        }
        this.isAPIInprogress = false;
      }
    }, (error) => {
     // console.log('getObservationSubmissionResult error', error);
    });
  }

  updateSubmissionandCompetency(passStatus) {
    let competency_data = this.observationData.competency_data[0];
    let key = Object.keys(competency_data)[0];
    let val = competency_data[key].split('-');

    let param = {
      mentee_id: this.observationData.mentee_id,
      mentor_id: this.observationData.mentor_id,
      competency_name: key,
      competency_id: val[0],
      competency_level_id: val[1],
      solution_name: this.observationData.solution_name,
      solution_id: this.observationData.solution_id,
      is_passbook_update_required: passStatus,
      mentoring_relationship_id: this.observationData.mentoring_relationship_id
    }
    this.userObserSvc.updateSubmissionandCompetency(param).subscribe(() => { });
  }
}
