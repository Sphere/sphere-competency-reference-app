export const mockBatch = 
{
    "batchId": "string",
    "createdBy": "string",
    "endDate": null,
    "enrollmentType": "string",
    "identifier": "string",
    "name": "string",
    "startDate": "string",
    "status":0,
    "cert_templates": null,
    "collectionId": "string",
    "courseId": "string",
    "createdDate": "string",
    "createdFor": [],
    "description": null,
    "enrollmentEndDate": null,
    "id": "string",
    "mentors": null,
    "tandc": null,
    "updatedDate": null
}
export enum EContentTypes {
    PROGRAM = 'Learning Path',
    CHANNEL = 'Channel',
    COURSE = 'Course',
    KNOWLEDGE_ARTIFACT = 'Knowledge Artifact',
    KNOWLEDGE_BOARD = 'Knowledge Board',
    LEARNING_JOURNEY = 'Learning Journeys',
    MODULE = 'Collection',
    RESOURCE = 'Resource',
}

export enum EMimeTypes {
    COLLECTION = 'application/vnd.ekstep.content-collection',
    ZIP = 'application/vnd.ekstep.html-archive',
    HTML = 'application/html',
    HTML_TEXT = 'text/html',
    ILP_FP = 'application/ilpfp',
    IAP = 'application/iap-assessment',
    M4A = 'audio/m4a',
    MP3 = 'audio/mpeg',
    MP4 = 'video/mp4',
    M3U8 = 'application/x-mpegURL',
    INTERACTION = 'video/interactive',
    PDF = 'application/pdf',
    QUIZ = 'application/json',
    DRAG_DROP = 'application/drag-drop',
    HTML_PICKER = 'application/htmlpicker',
    WEB_MODULE = 'application/web-module',
    WEB_MODULE_EXERCISE = 'application/web-module-exercise',
    YOUTUBE = 'video/x-youtube',
    HANDS_ON = 'application/integrated-hands-on',
    RDBMS_HANDS_ON = 'application/rdbms',
    CLASS_DIAGRAM = 'application/class-diagram',
    CHANNEL = 'application/channel',
    COLLECTION_RESOURCE = 'resource/collection',
    APPLICATION_JSON = 'application/json',
    // Added on UI Only
    CERTIFICATION = 'application/certification',
    PLAYLIST = 'application/playlist',
    TEXT_WEB = 'text/x-url',
    UNKNOWN = 'application/unknown',
}

export const content:any = {
    "addedOn": "string",
    "appIcon": "string",
    "artifactUrl": "string",
    "offlineArtifactUrl": "string",
    "certificationUrl": "string",
    "children": "",
    "complexityLevel": "string",
    "contentId": "string",
    "contentType": EContentTypes,
    "contentUrlAtSource": "string",
    "creatorContacts": [{
        "id": "string",
        "name": "string",
        "email": "string"
    }],
    "creatorDetails": [{
        "id": "string",
        "name": "string",
        "email": "string"
    }],
    "creatorLogo": "string",
    "creatorPosterImage": "string",
    "creatorThumbnail": "string",
    "curatedTags": [""],
    "description": "string",
    "displayContentType": "EDisplayContentTypes",
    "duration": 1,
    "hasAccess": true,
    "identifier": "string",
    "isExternal": 1,
    "isIframeSupported": 'Yes',
    "lastUpdatedOn": "string",
    "learningObjective": "string",
    "me_totalSessionsCount": 1,
    "mediaType": "string",
    "mimeType": EMimeTypes,
    "name": "string",
    "preRequisites": "string",
    "primaryCategory": "string",
    "publishedOn": "string",
    "resourceType": "string",
    "skills": [{
        "id": "string",
        "category": "string",
        "skill": "string",
        "name": "string"
    }],
    "sourceName": "string",
    "sourceShortName": "string",
    "status":'Draft',
    "tags": [{
        "id": "string",
        "type": "string",
        "value": "string"
    }],
    "topics": [{
        "identifier": "string",
        "name": "string"
    }],
    "track": [{
        "id": "string",
        "name": "string",
        "status": "string",
        "visibility": "string"
    }]
}

content.children = content;

export const mockFullContent = {...content};
const emptyArray =  [] as any;
export const mockBatchList = {
    "active": true,
    "addedBy": "string",
    "batch": mockBatch,
    "batchId": "string",
    "certificates": emptyArray,
    "collectionId": "string",
    "completedOn": "string",
    "completionPercentage": null,
    "completionStatus?": 0,
    "content": mockFullContent,
    "contentId": "string",
    "contentStatus": "any",
    "courseId": "string",
    "courseLogoUrl": "string",
    "courseName": "string",
    "dateTime": 122,
    "description": "string",
    "enrolledDate": "string",
    "issuedCertificates": emptyArray,
    "lastReadContentId": null,
    "lastReadContentStatus": null,
    "leafNodesCount": 2,
    "progress": 3,
    "status": 1,
    "userId": "1234"
}
export const mockUserProfileDetailsFromRegistry = {
    'firstname': "string",
    'motherTongue': "string",
    'secondaryEmail': "string",
    'gender': "string",
    '@type': "string",
    'mobile': 1,
    'middlename': "string",
    'telephone': 1,
    'osid': "string",
    'primaryEmailType': "string",
    'knownLanguages': [{
        name: "en"
    }],
    'wid': "string",
    'nationality': "string",
    'surname': "string",
    'dob': "string",
    'category': "string",
    'primaryEmail': "string",
    'maritalStatus': "string",
    'residenceAddress': "string",
    'academics': "any",
    'photo': "string",
    'personalDetails': "",
    'professionalDetails': "any",
    'skills': "any",
    'interests': "any"
  }