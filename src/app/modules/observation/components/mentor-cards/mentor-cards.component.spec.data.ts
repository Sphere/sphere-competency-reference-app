import { RouterLinks } from "../../../../app.constant";

export const mockDisplayConfigMentor = {
    arrowbtn: true,
    btnNavigation: `${RouterLinks.MENTOR}/${RouterLinks.MENTEE_PROGRESS}`
}

export const mockDisplayConfigStart = {
    button: true,
    buttonName: "start"
}

export const mockDisplayConfigProgress = {
    button: true,
    buttonName: "resume"
}

export const mockDisplayConfigCompleted = {
    button: false,
    buttonName: "download"
}

export const mockData = {
    "mentoring_relationship_id": "683d6370-e5b2-46d3-b4f7-105b8665682b",
    "mentor_id": "43241db1-63c4-4dea-ab7f-766088a928ed",
    "mentee_id": "c65f6cbb-6819-4bee-acc8-b2da7ec48621",
    "mentor_name": "Mentor Two",
    "mentee_name": "Nitesh",
    "mentee_designation": "ASHA",
    "mentee_contact_info": "*****21229",
    "createdat": "2023-11-14T10:30:00.000Z",
    "updatedat": "2023-11-14T10:30:00.000Z",
    "mentoring_observations": [
        {
            "type": "observation",
            "observation_id": "6583009795ce3d0008b8b827",
            "solution_id": "65818b177f665600082e6f19",
            "otp_verification_status": "verified",
            "submission_status": "submitted",
            "attempted_count": 26,
            "observationData": {
                "solution_id": "65818b177f665600082e6f19",
                "solution_name": "With rubrics",
                "competency_data": [
                    {
                        "Understands correct gramatical english": "218-1"
                    }
                ],
                "solution_link_id": "c3afd831da1bf2f26674e934757c71dd"
            }
        }
    ]
}