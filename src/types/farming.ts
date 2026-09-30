export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export interface FarmingInput {
  location: string;
  soilType: string;
  season: string;
  budget: string;
  farmSize: string;
  irrigation?: string;
  farmingGoal?: string;
}

export interface RecommendedCrop {
  cropName: string;
  suitabilityScore: number;
  expectedYield: string;
  estimatedProfit: string;
  reasoning: string;
  durationDays?: string;
  waterRequirement?: string;
}

export interface EcoGrowthStep {
  phase: string;
  timeline: string;
  organicInputs: string[];
  waterStrategy: string;
  keyPractices: string[];
}

export interface RiskAnalysis {
  pestRisks: string[];
  climateRisks: string[];
  mitigationTips: string[];
}

export interface MarketInsight {
  currentDemand: string;
  priceTrend: 'Upward' | 'Stable' | 'Downward';
  recommendedBuyerChannels: string[];
  peakSellingPeriod?: string;
}

export interface ReportData {
  recommendedCrops: RecommendedCrop[];
  ecoPlanSteps: EcoGrowthStep[];
  riskAnalysis: RiskAnalysis;
  marketInsights: MarketInsight;
  sustainabilityScore: number;
  summary: string;
  soilHealthAnalysis?: string;
}

export interface DiseaseDetectionRecord {
  id: string;
  userId: string;
  imageUrl: string;
  diseaseName: string;
  confidenceScore: number;
  type: 'Disease' | 'Pest' | 'Nutrient Deficiency' | 'Healthy';
  severity: 'Low' | 'Medium' | 'High';
  symptoms: string[];
  organicRemedies: string[];
  preventativeMeasures: string[];
  scientificName?: string;
  pathogenType?: string;
  spraySchedule?: string;
  createdAt: string;
}

export interface CompostMaterial {
  id: string;
  name: string;
  category: 'Green' | 'Brown';
  quantityKg: number;
  estimatedCN: number; // approximate carbon:nitrogen ratio
}

export interface CompostResult {
  cnRatio: string;
  estimatedReadyWeeks: number;
  moistureAdvice: string;
  recommendations: string[];
  qualityGrade: string;
  acceleratorTips?: string[];
  aerationSchedule?: string;
  warningFlags?: string[];
}

export interface CropRotationResult {
  currentCrop: string;
  nextCropRecommendations: {
    crop: string;
    benefit: string;
    soilImpact: string;
    botanicalFamily?: string;
    economicValue?: string;
  }[];
  intercroppingOptions: string[];
  soilHealthStrategy: string;
  rotationCycleSeasons?: {
    seasonName: string;
    cropName: string;
    purpose: string;
  }[];
}

export interface JournalEntry {
  id: number;
  date: string;
  plotName: string;
  activity: string;
  category: 'Sowing' | 'Bio-fertilizer' | 'Pest Management' | 'Irrigation' | 'Weeding' | 'Harvesting' | 'Pruning';
  inputsUsed: string;
  quantityApplied: string;
  harvestYield?: string;
  weatherNotes?: string;
  notes?: string;
}

export interface CommunityResource {
  id: string;
  title: string;
  type: 'Equipment' | 'Indigenous Seeds' | 'Bio-Inputs & Culture' | 'Organic Manure';
  ownerName: string;
  villageOrRegion: string;
  phoneOrContact: string;
  availability: 'Available' | 'In Use' | 'Seasonal';
  costType: 'Free / Barter' | 'Affordable Daily Rent' | 'Nominal Cost';
  costAmount?: string;
  description: string;
  rating?: number;
}

export interface OrganicRecipe {
  id: string;
  name: string;
  localName: string;
  category: 'Fertilizer' | 'Pest Repellent' | 'Fungicide' | 'Seed Treatment';
  targetIssues: string[];
  ingredients: { item: string; quantity: string }[];
  preparationSteps: string[];
  applicationRate: string;
  shelfLife: string;
  precautions: string;
}

export interface UserProfile {
  id: string;
  authMethod: 'phone' | 'google' | 'guest';
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  state?: string;
  district?: string;
  village?: string;
  mainCrop?: string;
  farmSize?: string;
  isGuest: boolean;
  profileComplete: boolean;
  createdAt: string;
}

export interface FarmListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  title: string;
  description: string;
  images: string[];
  price: number; // in INR
  landSizeAcres: number;
  state: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  cropType: string;
  soilType: string;
  waterAvailability: string;
  electricityAvailability: string;
  roadAccess: string;
  facilities: string[];
  status: 'published' | 'draft' | 'sold' | 'archived';
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FarmFilterState {
  searchQuery: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  landSizeRange: string;
  cropType: string;
  soilType: string;
  waterAvailability: string;
  sortBy: 'price_asc' | 'price_desc' | 'size_desc' | 'newest';
}



