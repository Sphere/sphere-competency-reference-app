import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../../../../../app/modules/observation/services/observation.service';
import { ConfigurationsService } from '../../../../../library/ws-widget/utils/src/lib/services/configurations.service';
import { RouterLinks } from '../../../../../app/app.constant';
import * as _ from 'lodash';

@Component({
  selector: 'app-learner-observation-completed',
  templateUrl: './learner-observation-completed.component.html',
  styleUrls: ['./learner-observation-completed.component.scss'],
})
export class LearnerObservationCompletedComponent implements OnInit {

  completedScheduleList: any[] = [];
  public displayConfigMentee = {
    arrowbtn: true,
    btnNavigation: `${RouterLinks.MENTOR}/${RouterLinks.VIEW_ATTEMPS}`,
  }
  public noResultData: any = {
    'message': 'No result found',
  }
  public isAPIInprogress = true;

  constructor(public userObserSvc: ObservationService,
    private configSvc: ConfigurationsService) {}

  ngOnInit() {
    this.getCompletedSechdules()
  }
  getCompletedSechdules() {
    const userId =this.configSvc.userProfile.userId;
    this.isAPIInprogress = true;
    this.userObserSvc.getAllCompletedSechedules(userId).subscribe((res) => {
      console.log("completed schedule by mente", res);
      this.completedScheduleList = this.mapToCompletedScheduleList(res)
      this.isAPIInprogress = false;
      console.log("completed schedule after processing ", this.completedScheduleList);
    });
  }

  private mapToCompletedScheduleList(data: any): any[] {
    if (_.isEmpty(data.result)) {
      console.log("No data available.");
      return [];
    }
    return _.map(data.result, (solutionData, solutionId) => ({
      solutionId,
      attempt_serial_number: solutionData.attempts.length,
      name: solutionData.solution_name,
      designation: _.get(solutionData, 'mentorMenteeInfo.mentor_name', ''),
      mentee_id: _.get(solutionData, 'mentorMenteeInfo.mentor_name', ''),
      attemptList: this.mapToAttemptList(solutionData.attempts, solutionData),
      result_percentage: _.get(_.last(solutionData.attempts), 'result_percentage', 0),
    }));
  }
  
  private mapToAttemptList(attempts: any[], solutionData: any) {
    return _.map(attempts, (attempt, index) => ({
      mentoring_relationship_id: attempt.mentoring_relationship_id,
      mentor_id: attempt.mentor_id,
      mentee_id: attempt.mentee_id,
      createdAt: this.getFormattedDate(attempt.createdAt),
      attempt_serial_number: attempt.attempt_serial_number,
      result_percentage: attempt.result_percentage,
      user_submission: attempt.user_submission,
      acquired_score: attempt.acquired_score,
      observationAttemptsMetaData: attempt.observationAttemptsMetaData,
      solution_id: attempt.solution_id,
      submission_id: attempt.submission_id,
      solution_name: _.get(attempt, 'observationAttemptsMetaData.solution_name', solutionData.solution_name),
      total_score: attempt.total_score,
      name: _.get(attempt, 'observationAttemptsMetaData.solution_name', solutionData.solution_name),
      attemptName: `Attempt ${index + 1}`,
      observation_id: attempt.observation_id,
      attempted_count: index + 1,
    }));
  }
  
  private getFormattedDate(data) {
    const date = new Date(data);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year} `;
  }
}
