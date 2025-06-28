import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { CommonUtilService } from '../../../../../services';

@Component({
  selector: 'ws-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    private commonUtilService: CommonUtilService,
  ) { }

  ngOnInit() {
  }
  homePage() {
    this.commonUtilService.updateAppLanguage('en');
    this.router.navigate([`/public/home`])
  }
}