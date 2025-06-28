import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '../../../../../app/app.constant';
import { LocalStorageService } from '../../../../../app/manage-learn/core';
import { UserService } from '../../../../../app/modules/home/services/user.service';

@Component({
  selector: 'app-view-attemps',
  templateUrl: './view-attemps.component.html',
  styleUrls: ['./view-attemps.component.scss'],
})
export class ViewAttempsComponent implements OnInit {
  displayConfig = {
    report: true,
    attempsOnly: true
  }
  viewByLearner = false;
  public prevUrl = `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`
  attempList: any = []
  constructor(
    private router: Router,
    public localStorage: LocalStorageService,
    private userHomeSvc: UserService,
  ) {
    const currentNavigation = this.router.getCurrentNavigation();

    if (currentNavigation && currentNavigation.extras) {
      if (currentNavigation.extras.state?.mentee_id) {
        this.localStorage.setLocalStorage('lastVisitedMenteeID', currentNavigation.extras.state?.mentee_id);
        this.localStorage.setLocalStorage('mentorId', currentNavigation.extras.state?.cardData.mentor_id);
        this.attempList = currentNavigation.extras.state?.cardData

        console.log("attemp list",currentNavigation.extras.state?.cardData)
        // this.getAttempsOfMentee(currentNavigation.extras.state?.cardData.mentor_id, currentNavigation.extras.state?.mentee_id);
      } else {
        this.fetchLastMenteeId();
      }
    }else {
      this.fetchLastMenteeId();
    }
   }

   fetchLastMenteeId(){

   }

  ngOnInit() {
    this.fetchActiveRole();
  }

  async fetchActiveRole(){
    let roleSelected = await this.userHomeSvc.getActiveRole();
    this.viewByLearner = (roleSelected == 'learner');
  }


  navigateToMenteeList() {
    this.router.navigate([this.prevUrl]);
  }

}
