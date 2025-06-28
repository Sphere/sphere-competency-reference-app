import { Component, Input, OnInit } from '@angular/core';
import * as _ from 'lodash'

@Component({
  selector: 'app-mobile-course-rating-view',
  templateUrl: './mobile-course-rating-view.component.html',
  styleUrls: ['./mobile-course-rating-view.component.scss'],
})
export class MobileCourseRatingViewComponent implements OnInit {

  @Input() courseData: any
  public rating: number = 3;
  public ratingArr = [1,2,3,4,5];
  cometencyData: { name: any; levels: string }[] = []
  showCompentencyDetails = true


  constructor() { }

  ngOnInit() {
    if (this.courseData.competencies_v1 && Object.keys(this.courseData.competencies_v1).length > 0) {
      _.forEach(JSON.parse(this.courseData.competencies_v1), (value: any) => {
        if (value.level) {
          this.cometencyData.push(
            {
              name: value.competencyName,
              levels: ` Level ${value.level}`
            }
          )
        }
        return this.cometencyData
      })
    }
  }

  showIcon(index:number) {
    if (this.rating >= index + 1) {
      return 'star';
    } else {
      return 'star_border';
    }
  }


}
