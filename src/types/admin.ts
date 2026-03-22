export interface Organization {
  id: string;
  name: string;
  location?: string;
  type?: "university" | "college" | "institute";
  verified: boolean;
}

export interface CollegeSettings {
  collegeName: string;
  collegeShortName?: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  tagline: string;
  logoUrl: string;
  logoDisplayMode?: "logo-only" | "text-only" | "both";
  brandingColors?: string[];
  cloudinaryCloudName?: string;
  cloudinaryPreset?: string;
  lastUpdated: any;
  updatedBy: string;
}

export interface PlacementSettings {
  id: string;
  organizationId: string;
  minCgpaForPlacements: number;
  maxBacklogsAllowed: number;
  mandatoryResumeFields: string[];
  allowedResumeFormats: string[];
  maxResumeSize: number;
  placementSeasonStart: string;
  placementSeasonEnd: string;
  requireCompanyVerification: boolean;
  companyVerificationDocuments: string[];
  notifyOnNewJob: boolean;
  notifyOnApplicationUpdate: boolean;
  notifyOnDriveRegistration: boolean;
  updatedAt: any;
  updatedBy: string;
}
