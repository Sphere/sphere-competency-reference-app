import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLinks } from '../../../../../app/app.constant';

@Component({
  selector: 'app-role-selector-dashboard',
  templateUrl: './role-selector-dashboard.component.html',
  styleUrls: ['./role-selector-dashboard.component.scss'],
})
export class RoleSelectorDashboardComponent implements OnInit {
  showSelectMentor: boolean = false;

  constructor(
    public router: Router,
  ) { }

  ngOnInit() {}

  learner(){
    this.router.navigate([RouterLinks.MY_COURSES]);
  }

  mentor(){ 
    // this.showSelectMentor = true;
    this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`]);
  }

  menteeList(){
    this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.MENTEES_LIST}`]);
    // this.showSelectMentor = false;
  }

  observation(){
    this.router.navigate([`${RouterLinks.MENTOR}/${RouterLinks.OBSERVATION_TRACK}`]);
    // this.showSelectMentor = false;
  }
}
