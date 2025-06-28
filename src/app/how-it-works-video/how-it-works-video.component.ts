import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-how-it-works-video',
  templateUrl: './how-it-works-video.component.html',
  styleUrls: ['./how-it-works-video.component.scss'],
})
export class HowItWorksVideoComponent implements OnInit {

  public videoLink: SafeResourceUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(params['videoLink']);
    });
  }

  close(){
    this.router.navigateByUrl('/page/home')
  }

}
