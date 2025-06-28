import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContentCorodovaService } from '../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-asha-learning-completed',
  templateUrl: './asha-learning-completed.component.html',
  styleUrls: ['./asha-learning-completed.component.scss'],
})
export class AshaLearningCompletedComponent  implements OnInit {
  @Input() ashaData;
  @Input() expand;
  @Input() completedCount?:number
  isExpanded: boolean = false;
  btnName: string = 'Start'
  levels = [1, 2, 3, 4, 5]
  showBtn = true
  constructor(private router: Router,
    private cordovasvc: ContentCorodovaService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.isExpanded = this.expand
    console.log("cardData", this.ashaData)
    console.log("start btn", this.showBtn)
  }


  
  viewCourses(data) {
    if (data.competencyID) {
     this.router.navigate(['/app/search'], {
       queryParams: { q: [
         `${data.competencyID}-1`,
         `${data.competencyID}-2`,
         `${data.competencyID}-3`,
         `${data.competencyID}-4`,
         `${data.competencyID}-5`
       ] ,
       competency: true,
       redirect: 'page/home'
     },
       queryParamsHandling: 'merge',
     })
    
   }
 }
}
