import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MdePopoverTrigger } from '@material-extended/mde';

@Component({
  selector: 'app-org-sourse-courses',
  templateUrl: './org-sourse-courses.component.html',
  styleUrls: ['./org-sourse-courses.component.scss'],
})
export class OrgSourseCoursesComponent implements OnInit {

  @Input() widget: any
  @Input() currentOrgData: any
  @Input() cometencyData: any
  @Input() btnText: string
  @ViewChild('target', { static: false }) target!: MdePopoverTrigger

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  gotoOverview(identifier: any) {
    this.router.navigate([`/app/toc/${identifier}/overview`])
  }

  loginRedirect(contentId: any) {
    this.router.navigateByUrl(`/app/toc/${contentId}/overview`)
  }

  showTarget(event: any) {
    if (window.innerWidth - event.clientX < 483) {
      this.target.targetOffsetX = event.clientX + 1
    }
  }

}
