import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContentCorodovaService } from '../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-asha-home',
  templateUrl: './asha-home.component.html',
  styleUrls: ['./asha-home.component.scss'],
})
export class AshaHomeComponent implements OnInit {
  @Input() ashaData;
  @Input() expand;
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



  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }


  startSelfAssesmentold(data: any, event: Event) {
    event.stopPropagation();
    console.log("query data ", data);

    this.cordovasvc.setAshaCardData(data)
    // this.cordovaSrv.setAshaData(ashaData)
    if (data.progress) {
      this.btnName = 'Continue';
      // Get the highest levelId
      const maxLevelId = Math.max(...data.progress.map((entry: any) => entry.levelId));

      // Filter entries that have the highest levelId
      const highestLevelEntries = data.progress.filter((entry: any) => entry.levelId === maxLevelId);
      console.log("Entries with highest levelId:", highestLevelEntries);

      let highestLevelEntry;

      // Prioritize the entry where passFailStatus is "Pass" and contentType is "course"
      highestLevelEntry = highestLevelEntries.find((entry: any) => entry.passFailStatus === 'Pass' && entry.contentType === 'course');

      // If no such entry is found, fall back to any entry with the highest levelId
      if (!highestLevelEntry) {
        highestLevelEntry = highestLevelEntries[0];
      }

      console.log("Selected highest level entry:", highestLevelEntry);

      const { contentType, passFailStatus, levelId, completionpercentage } = highestLevelEntry;

      if (contentType === 'selfAssessment' && passFailStatus === 'Pass') {

        // Case 1: Self-assessment passed
        this.router.navigate([`app/user/self-assessment`], { queryParams: data });
      } else {
        // Prepare to navigate to the course (for Cases 2, 3, and 4)
        let nextLevelId = levelId;

        // Move to the next level if the current level is completed (100% completion)
        if (completionpercentage === 100) {
          nextLevelId += 1;
        }

        let identifier: any = this.getCourseId(data.competencyID, nextLevelId, data)

        const req = {
          "request": {
            "filters": {
              // "competencySearch": [`${data.competencyID}-${nextLevelId}`],
              "primaryCategory": ["Course"],
              "contentType": ["Course"],
              "status": ["Live"],
              "identifier": identifier || ""
            },
            "sort_by": { "lastUpdatedOn": "desc" }
          },
          "sort": [{ "lastUpdatedOn": "desc" }]
        };

        this.cordovasvc.getAshaCompetencyCorses(req).subscribe(res => {
          console.log(res.result.content[0]);
          // const navigationdata = this.getNavigationData(res.result.content, nextLevelId ) 
          const navigationdata = res.result.content[0]
          const batchId = navigationdata.batches[0].batchId;
          let ashaData = {
            "isAsha": true,
            "batchid": batchId,
            "contentid": navigationdata.identifier,
            "competencylevel": nextLevelId,
            "completionpercentage": 0,
            "progress": "course",
            "competencyid": data.competencyID
          }

          this.cordovasvc.setAshaData(ashaData)

          // Navigate to the course page
          this.router.navigate([`/app/toc/${navigationdata.identifier}/overview`], {
            queryParams: {
              primaryCategory: 'Course',
              batchId: batchId,
              competencyid: data.competencyID,
              levelId: nextLevelId,
              courseid: data.contentId,
              isAsha: true
            },
          });
        });
      }
    } else {
      // No progress data, default to self-assessment
      this.router.navigate([`app/user/self-assessment`], { queryParams: data });
    }
  }


  startSelfAssesment(data: any, event: Event) {
    event.stopPropagation();
    console.log("query data ", data);

    this.cordovasvc.setAshaCardData(data);

    if (data.progress) {
      this.btnName = 'Continue';

      // Get the completed levels from progress data
      // const completedLevels = data.progress.map((entry: any) => entry.levelId);
      const completedLevels = data.progress
        .filter((entry: any) => entry.passFailStatus === 'Pass')
        .map((entry: any) => entry.levelId);

      // Define all possible levels (since there are only 5 levels)
      const allLevels = [1, 2, 3, 4, 5];

      // Find the minimum level that is not done
      // const nextIncompleteLevel = allLevels.find((level) => !completedLevels.includes(level)) || Math.max(...allLevels);

      // Find the minimum level that is not completed
      const nextIncompleteLevel = allLevels
        .filter((level) => !completedLevels.includes(level))
        .reduce((min, level) => (min === null || level < min ? level : min), null);


      console.log("Next incomplete level:", nextIncompleteLevel);

      // Filter entries that have the highest levelId
      let highestLevelEntries = data.progress.filter((entry: any) => entry.levelId === nextIncompleteLevel);

      // If nextIncompleteLevel has no matching entries in progress, use the highest completed level instead
      if (highestLevelEntries.length === 0) {
        const lowerCompletedLevels = completedLevels.filter((level) => level < nextIncompleteLevel);
        const fallbackLevel = lowerCompletedLevels.length > 0 
          ? Math.max(...lowerCompletedLevels) 
          : Math.min(...completedLevels, 0); // Default to 0 if no completed levels
        console.log("Falling back to highest completed level:", fallbackLevel);
        highestLevelEntries = data.progress.filter((entry) => entry.levelId === fallbackLevel);
      }

      console.log("Entries for next level:", highestLevelEntries);

      let highestLevelEntry;

      // Prioritize the entry where passFailStatus is "Pass" and contentType is "course"
      highestLevelEntry = highestLevelEntries.find((entry: any) => entry.passFailStatus === 'Pass' && entry.contentType === 'course');

      // If no such entry is found, fall back to any entry with the next incomplete level
      if (!highestLevelEntry) {
        highestLevelEntry = highestLevelEntries[0];
      }

      console.log("Selected entry:", highestLevelEntry);

      const { contentType, passFailStatus, levelId, completionpercentage } = highestLevelEntry || {};

      if (contentType === 'selfAssessment' && passFailStatus === 'Pass') {
        // Case 1: Self-assessment passed
        this.router.navigate([`app/user/self-assessment`], { queryParams: data });
      } else {
        // Prepare to navigate to the course (for Cases 2, 3, and 4)
        let nextLevelId = levelId || nextIncompleteLevel;

        // Move to the next level if the current level is completed (100% completion)
        if (completionpercentage === 100) {
          nextLevelId += 1;
        }

        let identifier: any = this.getCourseId(data.competencyID, nextLevelId, data);

        const req = {
          request: {
            filters: {
              primaryCategory: ["Course"],
              contentType: ["Course"],
              status: ["Live"],
              identifier: identifier || "",
            },
            sort_by: { lastUpdatedOn: "desc" },
          },
          sort: [{ lastUpdatedOn: "desc" }],
        };

        this.cordovasvc.getAshaCompetencyCorses(req).subscribe((res) => {
          console.log(res.result.content[0]);
          const navigationdata = res.result.content[0];
          const batchId = navigationdata.batches[0].batchId;

          let ashaData = {
            "isAsha": true,
            "batchid": batchId,
            "contentid": navigationdata.identifier,
            "competencylevel": nextLevelId,
            "completionpercentage": 0,
            "progress": "course",
            "competencyid": data.competencyID
          }

          this.cordovasvc.setAshaData(ashaData)

          // Navigate to the course page
          this.router.navigate([`/app/toc/${navigationdata.identifier}/overview`], {
            queryParams: {
              primaryCategory: 'Course',
              batchId: batchId,
              competencyid: data.competencyID,
              levelId: nextLevelId,
              courseid: data.contentId,
              isAsha: true,
            },
          });
        });
      }
    } else {
      // No progress data, default to self-assessment
      this.router.navigate([`app/user/self-assessment`], { queryParams: data });
    }
  }


  getCourseId(competencyId: string, levelId: string, ashaData: any): string | null {
    // Extract the language from the ashaData
    const language = ashaData.lang;

    // Iterate over the levels in the ashaData
    for (const level of ashaData.levels) {
      // Check if the competencyId and levelId match
      if (level.competencyId.toString() == competencyId && level.level == levelId) {

        // Iterate over the courses in the matched level
        for (const course of level.course) {
          // Check if the course language matches the input language (ashaData.lang)
          if (course.lang == language) {
            return course.id; // Return the matched course ID
          }
        }
      }
    }

    // If no match is found, return null
    return null;
  }



  getNavigationData(res, levelId) {
    console.log("Input data:", res); // Debugging the input array
    // const matchedContent = res.find(content => {
    //     // Ensure ashaData and its properties exist
    //     if (!this.ashaData || !this.ashaData.levels || !this.ashaData.lang) {
    //         console.error("ashaData or ashaData properties are undefined.");
    //         return false;
    //     }

    //     return this.ashaData.levels.some(level => {
    //         // Ensure levelId and course data are correct
    //         if (level.level == levelId) {
    //             return level.course.some(course => {
    //                 // Ensure course id and content identifier match (same type)
    //                 const courseIdMatches = course.id == content.identifier;
    //                 const languageMatches = content.lang == this.ashaData.lang;
    //                 if (courseIdMatches && languageMatches) {
    //                     return true; // Found a match
    //                 }else{
    //                   if (courseIdMatches) {
    //                     return true; // Found a match with courseId only
    //                 }
    //                 }
    //                 return false; // No match for this course
    //             });
    //         }
    //         return false; // Level does not match
    //     });
    // });


    let matchedContent = null;

    // Ensure ashaData and its properties exist
    if (!this.ashaData || !this.ashaData.levels || !this.ashaData.lang) {
      console.error("ashaData or ashaData properties are undefined.");
    } else {
      // Iterate through each content in res
      matchedContent = res.find(content => {
        // Iterate through all levels in ashaData
        for (let level of this.ashaData.levels) {
          if (level.level == levelId) {
            // Iterate through all courses in the level
            for (let course of level.course) {
              const courseIdMatches = course.id === content.identifier;
              const languageMatches = content.lang === this.ashaData.lang;

              console.log("Checking course:", course.id, content.identifier, content.lang, this.ashaData.lang);

              // First priority: Check if both courseIdMatches and languageMatches are true
              if (courseIdMatches && languageMatches) {
                console.log("Both matched:", course.id, content.identifier);
                matchedContent = content; // Found a match with both conditions
                return true; // Return immediately as we've found the desired match
              }
            }
          }
        }

        // If no match was found, look for courseIdMatches condition alone
        for (let level of this.ashaData.levels) {
          if (level.level == levelId) {
            for (let course of level.course) {
              const courseIdMatches = course.id === content.identifier;
              if (courseIdMatches) {
                console.log("Only courseIdMatches:", course.id, content.identifier);
                matchedContent = content; // Found a match for courseIdMatches alone
                return true; // Return immediately as we've found the match
              }
            }
          }
        }

        return false; // No match for this content
      });
    }

    // Check if a match was found
    if (matchedContent) {
      console.log("Matched content:", matchedContent);
    } else {
      console.log("No match found for levelId:", levelId);
    }

    return matchedContent;
  }


  getCompletionPercentage(): number {

    // Check if progress data exists; if not, set showBtn to true and return 0
    if (!this.ashaData?.progress || this.ashaData.progress.length === 0) {
      this.showBtn = true;
      return 0;
    }

    const completedLevels = this.ashaData?.progress?.filter((p: any) => p.passFailStatus === 'Pass').length || 0;
    let totalPercentage = (completedLevels / 5) * 100; // Assuming 5 levels total
    this.showBtn = totalPercentage === 100 ? false : true
    return totalPercentage
  }




  getLevelStyleold(levelId: number): string {
    // If ashaData or progress data is missing or empty, return 'lightgray' by default
    if (!this.ashaData || !this.ashaData.progress || this.ashaData.progress.length === 0) return 'lightgray';

    // const levelData = this.ashaData.progress.find((p: any) => p.levelId === levelId);
    // Find all entries with the specified levelId
    const levelEntries = this.ashaData.progress.filter((p: any) => p.levelId === levelId);

    // Check if any of the entries have a passFailStatus of 'Pass'
    const hasPassed = levelEntries.some((entry: any) => entry.passFailStatus === 'Pass');

    // Determine the last passed level
    const lastPassedLevel = this.getLastPassedLevel();
    if (hasPassed) {
      return 'green';
    } else if (levelEntries.some((entry: any) => entry.passFailStatus === 'Fail')) {
      return 'yellow';
    } else if (levelId === lastPassedLevel + 1) {
      return 'yellow';
    } else {
      return 'lightgray';
    }
  }

  getLevelStyle(levelId: number): string {
    // Ensure progress data exists
    if (!this.ashaData?.progress || this.ashaData.progress.length === 0) {
      return 'lightgray';
    }

    // Get completed and failed levels
    const completedLevels = this.ashaData.progress
      .filter((entry: any) => entry.passFailStatus === 'Pass')
      .map((entry: any) => entry.levelId);

    const failedLevels = this.ashaData.progress
      .filter((entry: any) => entry.passFailStatus === 'Fail')
      .map((entry: any) => entry.levelId);

    // Define all levels
    const allLevels = [1, 2, 3, 4, 5];

    // Find the next actionable level (minimum level not in completed levels)
    const nextLevel = allLevels.find((level) => !completedLevels.includes(level)) || Math.max(...allLevels);

    // Determine style
    if (completedLevels.includes(levelId)) {
      return 'green'; // Level passed
    } else if (failedLevels.includes(levelId) || levelId === nextLevel) {
      return 'yellow'; // Level failed or next actionable level
    } else {
      return 'lightgray'; // Unattempted and not next actionable
    }
  }



  getLastPassedLevel(): number {
    // Extract all passed levels from progress data
    const passedLevels = this.ashaData?.progress?.filter((p: any) => p.passFailStatus === 'Pass').map((p: any) => p.levelId);
    // Return the highest level ID if any level is passed, otherwise return 0
    return passedLevels?.length > 0 ? Math.max(...passedLevels) : 0;
  }


  

  getLevelNote(): string {
    const initialLevel = 1;
  
    // Check if ashaData and progress exist
    if (!this.ashaData?.progress || !Array.isArray(this.ashaData.progress)) {
      return this.translate.instant('LEVEL_NOTE');
    }

    // // Check if all levels are completed
    // if (this.getCompletionPercentage() === 100) {
    //   return this.translate.instant('YOU_CLEAR_ALL_LEVELS')
    //   // return 'Note: You have cleared all the levels and you have gained this competency.';
    // }
  
    const completedLevels = this.ashaData.progress
      .filter((entry: any) => entry.passFailStatus === 'Pass')
      .map((entry: any) => entry.levelId);
  
    const allLevels = [1, 2, 3, 4, 5];
  
    // Find the next incomplete level
    const nextIncompleteLevel = allLevels
      .filter((level) => !completedLevels.includes(level))
      .reduce((min, level) => (min === null || level < min ? level : min), null);

      // If all levels are completed
    if (nextIncompleteLevel === null) {
      return this.translate.instant('YOU_CLEAR_ALL_LEVELS')
    }
  
    // Filter entries for the next incomplete level
    let nextLevelEntries = this.ashaData.progress.filter((entry: any) => entry.levelId === nextIncompleteLevel);
  
    // If no entries exist for the next incomplete level, fallback to the closest lower completed level
    if (nextLevelEntries.length === 0) {
      const lowerCompletedLevels = completedLevels.filter((level) => level < nextIncompleteLevel);
      const fallbackLevel = lowerCompletedLevels.length > 0
        ? Math.max(...lowerCompletedLevels)
        : Math.min(...completedLevels, 0);
      nextLevelEntries = this.ashaData.progress.filter((entry: any) => entry.levelId === fallbackLevel);
    }
  
    // Select the highest priority entry
    let selectedEntry = nextLevelEntries.find(
      (entry: any) => entry.passFailStatus === 'Pass' && entry.contentType === 'course'
    );
  
    if (!selectedEntry) {
      selectedEntry = nextLevelEntries[0];
    }
  
    const { contentType, passFailStatus, levelId, completionpercentage } = selectedEntry || {};
  
    if (selectedEntry) {

      if(selectedEntry.levelId === 5 && selectedEntry.passFailStatus === 'Pass' && selectedEntry.completionpercentage === 100) {
        return this.translate.instant('YOU_CLEAR_ALL_LEVELS')
      }

      if (selectedEntry.passFailStatus === 'Fail') {
        if (contentType === 'course') {
          return this.translate.instant('NOTE_CLEAR_COURSE', { nextLevel: levelId });
        } else {
          return this.translate.instant('NOTE_CLEAR_ASSESSMENT', { nextLevel: levelId });
        }
      } else if (selectedEntry.passFailStatus === 'Pass') {
        if (contentType === 'course') {
          return this.translate.instant('COMPLETE_LEVEL_COURSE', { nextLevel: levelId + 1 });
        } else {
          return this.translate.instant('COMPLETE_LEVEL_ASSESSMENT', { nextLevel: levelId + 1 });
        }
      }
    } else {
      if (contentType === 'selfAssessment' && passFailStatus === 'Pass') {
        return this.translate.instant('CLEAR_LEVEL_ASSESSMENT', { nextLevel: levelId });
      } else if (contentType === 'selfAssessment' && passFailStatus === 'Fail') {
        return this.translate.instant('CLEAR_LEVEL_COURSE', { nextLevel: levelId });
      } else {
        return this.translate.instant('CLEAR_LEVEL_COURSE', { nextLevel: levelId ? levelId : 1 });
      }
    }
  
  }
  

}
