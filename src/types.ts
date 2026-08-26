export type ListingType = "WTB" | "WTS" | "MATCH";

export type EquipmentCategory =
  | "All"
  | "Precision Optics & Lasers"
  | "Semiconductor & Cleanroom"
  | "Industrial CNC & Machining"
  | "Lab & Metrology Testing"
  | "High-Voltage & Power Systems"
  | "Automation & Robotics"
  | "Aerospace & Avionics Surplus";

export type ConditionGrade = 
  | "New / Unopened (NOS)"
  | "Refurbished / Calibrated"
  | "Working / Tested"
  | "Untested / As-Is"
  | "Parts / Core";

export interface InferredContact {
  entityName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  location: string;
  sourceDomain: string;
  sourceUrl: string;
  inferenceConfidence: number; // 0 - 100%
  inferenceMethod: "Direct Web Crawl" | "Whois / Registry" | "Listing Footer Regex" | "PDF Spec Sheet / Invoice" | "Entity Resolution Model";
  verifiedStatus: "Verified" | "High Confidence" | "Needs Confirmation";
  notes?: string;
}

export interface MarketComp {
  source: string;
  date: string;
  price: number;
  condition: string;
  url?: string;
}

export interface EquipmentListing {
  id: string;
  type: ListingType;
  title: string;
  category: Exclude<EquipmentCategory, "All">;
  make: string;
  model: string;
  year?: number;
  partNumber?: string;
  serialNumber?: string;
  priceTarget: number; // Target price for WTB or Asking price for WTS
  currency: string;
  marketCompAverage: number;
  condition: ConditionGrade;
  specs: Record<string, string>;
  description: string;
  urgencyOrAvailability: "Immediate" | "Within 14 Days" | "30+ Days" | "Flexible";
  contact: InferredContact;
  tags: string[];
  discoveredAt: string;
  lastVerifiedAt: string;
  matchScore?: number; // Calculated match percentage if matched
  matchedWithId?: string;
  marginSpreadEstimate?: number;
  status: "Active" | "Matched" | "Indexed" | "Dispatched to Shopify" | "Archived";
  githubIndexRef?: string;
}

export interface WTBRequest {
  id: string;
  buyerOrganization: string;
  targetMake: string;
  targetModel: string;
  maxBudget: number;
  currency: string;
  conditionAcceptance: ConditionGrade[];
  urgency: "Immediate / Mission Critical" | "Standard (14 Days)" | "Flexible";
  requiredSpecs: string[];
  matchedListingsCount: number;
  createdAt: string;
  status: "Open Demand" | "Sourcing In Progress" | "Candidates Found" | "Fulfilled";
}

export interface SourcingScanResult {
  query: string;
  timestamp: string;
  foundCount: number;
  items: EquipmentListing[];
  inferredContactsCount: number;
  summaryNote: string;
}

export interface MarketDepthItem {
  id: string;
  item: string;
  category: string;
  bidPrice: number; // Highest WTB
  askPrice: number; // Lowest WTS
  spread: number;
  spreadPercent: number;
  wtbVolume: number;
  wtsVolume: number;
  liquidityTier: "High" | "Medium" | "Low";
}

/* =========================================================
   NORMS ARCHITECTURE & CHARTER TYPES
   ========================================================= */

export type NormCategory =
  | "All"
  | "Communication"
  | "Engineering"
  | "Reciprocity & Social"
  | "Meetings & Time"
  | "Decision Making"
  | "Cross-Cultural"
  | "Trade & Compliance"
  | "Leadership";

export interface NormComment {
  id: string;
  author: string;
  avatar: string;
  role: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Norm {
  id: string;
  title: string;
  category: Exclude<NormCategory, "All">;
  tagline: string;
  description: string;
  triggerSituation: string;
  explicitRule: string;
  violationRemedy: string;
  reciprocityIndex: number;
  frictionRisk: "Low" | "Medium" | "High";
  clarityScore: number;
  antiPatterns: string[];
  adoptionWeeks: number;
  culturalContextNotes?: string;
  votesCount: number;
  adoptionsCount: number;
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
    organization?: string;
  };
  comments?: NormComment[];
  isCustom?: boolean;
  userVoted?: boolean;
  userSaved?: boolean;
}

export interface CharterMemberVote {
  id: string;
  memberName: string;
  role: string;
  avatar: string;
  status: "approved" | "nuanced" | "blocked";
  comment?: string;
  votedAt: string;
}

export interface TeamCharter {
  id: string;
  title: string;
  teamName: string;
  description: string;
  norms: Norm[];
  createdAt: string;
  updatedAt: string;
  members: CharterMemberVote[];
}

export interface AuditResult {
  overallHealthScore: number;
  clarityScore: number;
  reciprocityScore: number;
  psychologicalSafetyScore: number;
  strengths: string[];
  criticalFrictionPoints: Array<{
    risk: string;
    impact: "High" | "Medium" | "Low";
    unwrittenAssumption: string;
    recommendedPatch: string;
  }>;
  missingCrucialNorms: string[];
  executiveSummary: string;
}

export interface ConflictResolution {
  title: string;
  synthesisRationale: string;
  theGoldenRule: string;
  whenToLeanA: string;
  whenToLeanB: string;
  escalationProtocol: string;
}

export interface SocialExchangeScenario {
  id: string;
  title: string;
  context: string;
  actorA: string;
  actorB: string;
  choiceOptions: {
    id: string;
    action: string;
    outcomeText: string;
    equityImpactA: number;
    equityImpactB: number;
    relationshipTrustChange: number;
    socialTheoryPrinciple: string;
  }[];
}
