export const urlConstants = {
  SERVICES: {
    UNNATI: '/improvement-project/apis/public/v8/mobileApp/kong/',
    KENDRA: '/kendra/apis/public/v8/mobileApp/kong/',
    SAMIKSHA: '/assessment/apis/public/v8/mobileApp/kong/',
    DHITI: '/dhiti/apis/public/v8/mobileApp/kong/',
    SUNBIRD: '/sunbird/apis/public/v8/mobileApp/kong/',
  },
  API_URLS: {
    PROGRAM_LISTING: '/apis/public/v8/mobileApp/kong/users/mlcore/v1/programs?',
    GET_TARGETED_SOLUTIONS: '/apis/public/v8/mobileApp/kong/solutions/mlcore/v1/targetedSolutions',
    SOLUTIONS_LISTING: '/apis/public/v8/mobileApp/kong/users/mlcore/v1/solutions/',
    GET_PROJECT: '/apis/public/v8/mobileApp/kong/userProjects/mlprojects/v1/details',
    PRIVATE_PROGRAMS: '/v1/users/privatePrograms',
    GET_SUB_ENITIES_FOR_ROLES: '/apis/public/v8/mobileApp/kong/entities/mlcore/v1/subEntityListBasedOnRoleAndLocation/',
    GET_ENTITY_LIST: '/apis/public/v8/mobileApp/kong/entities/mlcore/v1/subEntityList/',
    GET_REPORT: '/apis/public/v8/mobileApp/kong/reports/mlprojects/v1/entity/',
    GET_FULL_REPORT: '/apis/public/v8/mobileApp/kong/reports/mlprojects/v1/detailView/',
    GET_PROGRAM_BY_ENTITY: '/apis/public/v8/mobileApp/kong/reports/mlprojects/v1/getProgramsByEntity',
    SYNC_PROJECT: '/apis/public/v8/mobileApp/kong/userProjects/mlprojects/v1/sync/',
    CREATE_PROJECT: '/apis/public/v8/mobileApp/kong/userProjects/mlprojects/v1/add',
    START_ASSESSMENT: '/apis/public/v8/mobileApp/kong/userProjects/mlprojects/v1/solutionDetails/',
    PROJCET_TASK_STATUS: '/apis/public/v8/mobileApp/kong/userProjects/mlprojects/v1/tasksStatus/',
    GET_SHARABLE_PDF: '/apis/public/v8/mobileApp/kong/userProjects/mlprojects/v1/share/',
    GET_OBSERVATION_ENTITIES: '/apis/public/v8/mobileApp/kong/observations/mlsurvey/v1/entities',
    GET_OBSERVATION_SUBMISSIONS: '/apis/public/v8/mobileApp/kong/observationSubmissions/mlsurvey/v1/list/',
    GET_OBSERVATION_DETAILS: '/apis/public/v8/mobileApp/kong/observations/mlsurvey/v1/assessment/',
    MANDATORY_ENTITY_TYPES_FOR_ROLES: '/apis/public/v8/mobileApp/kong/entities/mlcore/v1/entityTypesByLocationAndRole/',
    GET_OBSERVATION_SUBMISSION_COUNT: '/apis/public/v8/mobileApp/kong/observations/mlreports/v1/submissionsCount',
    OBSERVATION_SUBMISSION_UPDATE: '/apis/public/v8/mobileApp/kong/observationSubmissions/mlsurvey/v1/update/',
    OBSERVATION_SUBMISSION_CREATE: '/apis/public/v8/mobileApp/kong/observationSubmissions/mlsurvey/v1/create/',
    SEARCH_ENTITY: '/apis/public/v8/mobileApp/kong/observations/mlsurvey/v1/searchEntities',
    OBSERVATION_UPDATE_ENTITES: '/apis/public/v8/mobileApp/kong/observations/mlsurvey/v1/updateEntities/',
    SUBMISSION: 'v1/submissions/make/', //TODO its assessment submissionAPI
    TARGETTED_ENTITY_TYPES: '/apis/public/v8/mobileApp/kong/users/mlcore/v1/targetedEntity/',
    OBSERVATION_REPORT_SOLUTION_LIST: '/apis/public/v8/mobileApp/kong/observationSubmissions/mlsurvey/v1/solutionList?',
    GENERIC_REPORTS: '/apis/public/v8/mobileApp/kong/reports/mlreports/v1/fetch',
    PROJECT_TEMPLATE_DETAILS: '/apis/public/v8/mobileApp/kong/project/mlprojects/v1/templates/details/',
    ALL_EVIDENCE: '/apis/public/v8/mobileApp/kong/observations/mlsurvey/v1/listAllEvidences',
    TEMPLATE_DETAILS:'/apis/public/v8/mobileApp/kong/solutions/mlcore/v1/details/',//+SOL ID
    SURVEY_FEEDBACK: {
      GET_DETAILS_BY_ID: '/apis/public/v8/mobileApp/kong/surveys/mlsurvey/v1/details',
      MAKE_SUBMISSION: '/apis/public/v8/mobileApp/kong/surveySubmissions/mlsurvey/v1/update/',
      LIST_ALL_EVIDENCES: '/apis/public/v8/mobileApp/kong/surveys/mlreports/v1/listAllEvidences',
      GET_ALL_ANSWERS: '/apis/public/v8/mobileApp/kong/surveys/mlreports/v1/getAllResponsesOfQuestion/',
    },
    DEEPLINK: {
      // VERIFY_OBSERVATION_LINK: '/apis/public/v8/mobileApp/kong/solutions/mlsurvey/v1/verifyLink/',
      VERIFY_LINK: '/apis/public/v8/mobileApp/kong/solutions/mlcore/v1/verifyLink/', //LINK
    },
    PRESIGNED_URLS: '/apis/public/v8/mobileApp/kong/cloud-services/mlcore/v1/files/preSignedUrls',
    IMPORT_LIBRARY_PROJECT:'/apis/public/v8/mobileApp/kong/userProjects/mlprojects/v1/importFromLibrary/' //tempID?isATargetedSolution=false

  },
};