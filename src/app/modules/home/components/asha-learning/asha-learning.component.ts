import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContentCorodovaService } from '../../../../../library/ws-widget/collection/src/lib/_services/content-corodova.service';
import { TranslateService } from '@ngx-translate/core';
import { RouterLinks } from '../../../../../app/app.constant'
import { CommonUtilService } from '../../../../../services'
import * as _ from 'lodash-es'

@Component({
  selector: "app-asha-learning",
  templateUrl: "./asha-learning.component.html",
  styleUrls: ["./asha-learning.component.scss"],
})
export class AshaLearningComponent implements OnInit {
  @Input() ashaData;
  @Input() expand;
  @Input() inProgressCoursesCount?:number
  isExpanded: boolean = false;
  btnName: string = "Start";
  levels = [1, 2, 3, 4, 5];
  showBtn = true;
  completedLevels: number[] = [];
  failedLevels: number[] = [];
  currentLevel = 0;
  nextLevelInfo :any;
  constructor(
    private router: Router,
    private cordovasvc: ContentCorodovaService,
    private translate: TranslateService,
     private commonUtilService: CommonUtilService,
  ) {}

  async ngOnInit() {
    console.log("expand input:", this.expand); // Should be true for first item, false for others
    this.isExpanded = this.expand;
    console.log("isExpanded after assignment:", this.expand)
    await this.getLevelStyle()
    console.log("cardData", this.ashaData);
    console.log("start btn", this.showBtn);
    this.nextLevelInfo = await this.getNextLevelEntriesAndLabel(this.ashaData);
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
  getNextLevelEntriesAndLabel(data: any): { highestLevelEntries: any[]; label: string } {
    if (!data?.progress?.length) {
      return { highestLevelEntries: [], label: 'START_SELF_ASSESSMENT' };
    }
    const completedLevels = data.progress
      .filter((entry: any) => entry.passFailStatus === "Pass")
      .map((entry: any) => entry.levelId);
      const allLevels = [1, 2, 3, 4, 5];
    const nextIncompleteLevel = allLevels
        .filter((level) => !completedLevels.includes(level))
        .reduce(
          (min, level) => (min === null || level < min ? level : min),
          null
        );
    let highestLevelEntries = _.filter(data.progress, { levelId: nextIncompleteLevel });
  
    if (_.isEmpty(highestLevelEntries)) {
      const lowerCompletedLevels = completedLevels.filter((level: number) => level < nextIncompleteLevel);
      const fallbackLevel = lowerCompletedLevels.length > 0
        ? Math.max(...lowerCompletedLevels)
        : Math.min(...completedLevels, 0);
  
      console.log('Falling back to highest completed level:', fallbackLevel);
      highestLevelEntries = _.filter(data.progress, { levelId: fallbackLevel });
    }
    const { contentType, passFailStatus } = highestLevelEntries[0] || {};
    let label = '';
    if (contentType === 'selfAssessment') {
      label = passFailStatus === 'Pass' ? 'START_SELF_ASSESSMENT' : 'START_COURSE';
    } else if (contentType === 'course') {
      label = 'START_COURSE';
    }
    return { highestLevelEntries, label };
  }
  
  startSelfAssesment(data: any, event: Event) {
    event.stopPropagation();
    console.log("query data ", data);

    this.cordovasvc.setAshaCardData(data);

    if (data.progress) {
      this.btnName = "Continue";

      // Get the completed levels from progress data
      // const completedLevels = data.progress.map((entry: any) => entry.levelId);
      const completedLevels = data.progress
        .filter((entry: any) => entry.passFailStatus === "Pass")
        .map((entry: any) => entry.levelId);

      // Define all possible levels (since there are only 5 levels)
      const allLevels = [1, 2, 3, 4, 5];

      // Find the minimum level that is not done
      // const nextIncompleteLevel = allLevels.find((level) => !completedLevels.includes(level)) || Math.max(...allLevels);

      // Find the minimum level that is not completed
      const nextIncompleteLevel = allLevels
        .filter((level) => !completedLevels.includes(level))
        .reduce(
          (min, level) => (min === null || level < min ? level : min),
          null
        );

      console.log("Next incomplete level:", nextIncompleteLevel);

      // Filter entries that have the highest levelId
      let highestLevelEntries = data.progress.filter(
        (entry: any) => entry.levelId === nextIncompleteLevel
      );

      // If nextIncompleteLevel has no matching entries in progress, use the highest completed level instead
      if (highestLevelEntries.length === 0) {
        const lowerCompletedLevels = completedLevels.filter(
          (level) => level < nextIncompleteLevel
        );
        const fallbackLevel =
          lowerCompletedLevels.length > 0
            ? Math.max(...lowerCompletedLevels)
            : Math.min(...completedLevels, 0); // Default to 0 if no completed levels
        console.log("Falling back to highest completed level:", fallbackLevel);
        highestLevelEntries = data.progress.filter(
          (entry) => entry.levelId === fallbackLevel
        );
      }

      console.log("Entries for next level:", highestLevelEntries);

      let highestLevelEntry;

      // Prioritize the entry where passFailStatus is "Pass" and contentType is "course"
      highestLevelEntry = highestLevelEntries.find(
        (entry: any) =>
          entry.passFailStatus === "Pass" && entry.contentType === "course"
      );

      // If no such entry is found, fall back to any entry with the next incomplete level
      if (!highestLevelEntry) {
        highestLevelEntry = highestLevelEntries[0];
      }

      console.log("Selected entry:", highestLevelEntry);

      const { contentType, passFailStatus, levelId, completionpercentage } =
        highestLevelEntry || {};

      if (contentType === "selfAssessment" && passFailStatus === "Pass") {
        // Case 1: Self-assessment passed
        this.router.navigate([`app/user/self-assessment`], {
          queryParams: data,
        });
      } else {
        // Prepare to navigate to the course (for Cases 2, 3, and 4)
        let nextLevelId = levelId || nextIncompleteLevel;

        // Move to the next level if the current level is completed (100% completion)
        if (completionpercentage === 100) {
          nextLevelId += 1;
        }

        let identifier: any = this.getCourseId(
          data.competencyID,
          nextLevelId,
          data
        );

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
            isAsha: true,
            batchid: batchId,
            contentid: navigationdata.identifier,
            competencylevel: nextLevelId,
            completionpercentage: 0,
            progress: "course",
            competencyid: data.competencyID,
          };

          this.cordovasvc.setAshaData(ashaData);

          // Navigate to the course page
          this.router.navigate(
            [`/app/toc/${navigationdata.identifier}/overview`],
            {
              queryParams: {
                primaryCategory: "Course",
                batchId: batchId,
                competencyid: data.competencyID,
                levelId: nextLevelId,
                courseid: data.contentId,
                isAsha: true,
              },
            }
          );
        });
      }
    } else {
      // No progress data, default to self-assessment
      this.router.navigate([`app/user/self-assessment`], { queryParams: data });
    }
  }

  getCourseId(
    competencyId: string,
    levelId: string,
    ashaData: any
  ): string | null {
    // Extract the language from the ashaData
    const language = ashaData.lang;

    // Iterate over the levels in the ashaData
    for (const level of ashaData.levels) {
      // Check if the competencyId and levelId match
      if (
        level.competencyId.toString() == competencyId &&
        level.level == levelId
      ) {
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
    let matchedContent = null;

    // Ensure ashaData and its properties exist
    if (!this.ashaData || !this.ashaData.levels || !this.ashaData.lang) {
      console.error("ashaData or ashaData properties are undefined.");
    } else {
      // Iterate through each content in res
      matchedContent = res.find((content) => {
        // Iterate through all levels in ashaData
        for (let level of this.ashaData.levels) {
          if (level.level == levelId) {
            // Iterate through all courses in the level
            for (let course of level.course) {
              const courseIdMatches = course.id === content.identifier;
              const languageMatches = content.lang === this.ashaData.lang;

              console.log(
                "Checking course:",
                course.id,
                content.identifier,
                content.lang,
                this.ashaData.lang
              );

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
                console.log(
                  "Only courseIdMatches:",
                  course.id,
                  content.identifier
                );
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

    const completedLevels =
      this.ashaData?.progress?.filter((p: any) => p.passFailStatus === "Pass")
        .length || 0;
    let totalPercentage = (completedLevels / 5) * 100; // Assuming 5 levels total
    this.showBtn = totalPercentage === 100 ? false : true;
    return totalPercentage;
  }

  async getLevelStyle() {
    const progress = this.ashaData?.progress || [];
    this.completedLevels = progress
      .filter((entry: any) => entry.passFailStatus === "Pass")
      .map((entry: any) => entry.levelId);

    this.failedLevels = progress
      .filter((entry: any) => entry.passFailStatus === "Fail")
      .map((entry: any) => entry.levelId);

    const nextLevel = this.levels.find(
      (level) => !this.completedLevels.includes(level)
    );

    this.currentLevel = nextLevel
      ? this.levels.indexOf(nextLevel)
      : this.levels.length;
  }

  getLevelNote(): string {
    const initialLevel = 1;

    // Check if ashaData and progress exist
    if (!this.ashaData?.progress || !Array.isArray(this.ashaData.progress)) {
      return this.translate.instant("LEVEL_NOTE");
    }

    // // Check if all levels are completed
    // if (this.getCompletionPercentage() === 100) {
    //   return this.translate.instant('YOU_CLEAR_ALL_LEVELS')
    //   // return 'Note: You have cleared all the levels and you have gained this competency.';
    // }

    const completedLevels = this.ashaData.progress
      .filter((entry: any) => entry.passFailStatus === "Pass")
      .map((entry: any) => entry.levelId);

    const allLevels = [1, 2, 3, 4, 5];

    // Find the next incomplete level
    const nextIncompleteLevel = allLevels
      .filter((level) => !completedLevels.includes(level))
      .reduce(
        (min, level) => (min === null || level < min ? level : min),
        null
      );

    // If all levels are completed
    if (nextIncompleteLevel === null) {
      return this.translate.instant("YOU_CLEAR_ALL_LEVELS");
    }

    // Filter entries for the next incomplete level
    let nextLevelEntries = this.ashaData.progress.filter(
      (entry: any) => entry.levelId === nextIncompleteLevel
    );

    // If no entries exist for the next incomplete level, fallback to the closest lower completed level
    if (nextLevelEntries.length === 0) {
      const lowerCompletedLevels = completedLevels.filter(
        (level) => level < nextIncompleteLevel
      );
      const fallbackLevel =
        lowerCompletedLevels.length > 0
          ? Math.max(...lowerCompletedLevels)
          : Math.min(...completedLevels, 0);
      nextLevelEntries = this.ashaData.progress.filter(
        (entry: any) => entry.levelId === fallbackLevel
      );
    }

    // Select the highest priority entry
    let selectedEntry = nextLevelEntries.find(
      (entry: any) =>
        entry.passFailStatus === "Pass" && entry.contentType === "course"
    );

    if (!selectedEntry) {
      selectedEntry = nextLevelEntries[0];
    }

    const { contentType, passFailStatus, levelId, completionpercentage } =
      selectedEntry || {};

    if (selectedEntry) {
      if (
        selectedEntry.levelId === 5 &&
        selectedEntry.passFailStatus === "Pass" &&
        selectedEntry.completionpercentage === 100
      ) {
        return this.translate.instant("YOU_CLEAR_ALL_LEVELS");
      }

      if (selectedEntry.passFailStatus === "Fail") {
        if (contentType === "course") {
          return this.translate.instant("NOTE_CLEAR_COURSE", {
            nextLevel: levelId,
          });
        } else {
          return this.translate.instant("NOTE_CLEAR_ASSESSMENT", {
            nextLevel: levelId,
          });
        }
      } else if (selectedEntry.passFailStatus === "Pass") {
        if (contentType === "course") {
          return this.translate.instant("COMPLETE_LEVEL_COURSE", {
            nextLevel: levelId + 1,
          });
        } else {
          return this.translate.instant("COMPLETE_LEVEL_ASSESSMENT", {
            nextLevel: levelId + 1,
          });
        }
      }
    } else {
      if (contentType === "selfAssessment" && passFailStatus === "Pass") {
        return this.translate.instant("CLEAR_LEVEL_ASSESSMENT", {
          nextLevel: levelId,
        });
      } else if (
        contentType === "selfAssessment" &&
        passFailStatus === "Fail"
      ) {
        return this.translate.instant("CLEAR_LEVEL_COURSE", {
          nextLevel: levelId,
        });
      } else {
        return this.translate.instant("CLEAR_LEVEL_COURSE", {
          nextLevel: levelId ? levelId : 1,
        });
      }
    }
  }
}
