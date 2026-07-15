// Copyright Sierra

// Types used by the recreation.gov API. Really just to keep the knowledge.ts file readable.

export type RidbMedia = {
    EntityMediaID: string;
    EntityID: string;
    EntityType: string;
    MediaType: string;
    Title: string;
    Subtitle: string;
    Description: string;
    Credits: string;
    URL: string;
    Width: number;
    Height: number;
    IsPrimary: boolean;
    IsPreview: boolean;
    IsGallery: boolean;
};

export type RidbFacility = {
    FacilityID: string;
    FacilityName: string;
    FacilityTypeDescription: string;
    FacilityDescription: string;
    FacilityDirections: string;
    FacilityPhone: string;
    FacilityEmail: string;
    FacilityLatitude: number;
    FacilityLongitude: number;
    FacilityAdaAccess: string;
    FacilityAccessibilityText: string;
    FacilityUseFeeDescription: string;
    FacilityReservationURL: string;
    FacilityMapURL: string;
    Reservable: boolean;
    StayLimit: string;
    Keywords: string;
    Enabled: boolean;
    MEDIA: RidbMedia[];
};

export type RidbFacilitiesResponse = {
    METADATA: {
        RESULTS: {
            CURRENT_COUNT: number;
            TOTAL_COUNT: number;
        };
        SEARCH_PARAMETERS: {
            LIMIT: number;
            OFFSET: number;
            QUERY: string;
        };
    };
    RECDATA: RidbFacility[];
};
