export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export type FileCategory = 'fayda_id' | 'document' | 'payment_proof';

export interface ApplicationFile {
  id: string;
  application_id: string;
  file_category: FileCategory;
  file_path: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: string;
  signedUrl?: string;
}

export interface Application {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name: string;
  age?: number;
  full_address: string;
  phone: string;
  email: string;
  qualification: string;
  course_applied: string;
  signature: string;
  place: string;
  submission_date: string;
  status: ApplicationStatus;
  payment_method?: string;
  transaction_ref?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  files?: ApplicationFile[];
}

export interface ContactMessage {
  id: string;
  email: string;
  message: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string; // e.g. "Telebirr", "Commercial Bank of Ethiopia (CBE)", "Awash Bank", "CBE Birr"
  type: 'mobile_money' | 'bank_account';
  accountNumber: string; // Phone number or Bank Account number
  accountName: string;
  instructions?: string;
  is_active: boolean;
}

// CMS Models
export interface CmsStat {
  id: string;
  stat_key: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  sort_order: number;
}

export interface CmsCourse {
  id: string;
  title: string;
  duration: string;
  level: string;
  category: 'job-ready' | 'pgd' | 'tech' | 'business';
  specialization?: string;
  status: 'Active' | 'Coming Soon' | 'Archived';
  is_featured: boolean;
  sort_order: number;
  clicks_count?: number;
}

export interface CmsFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

export interface CmsSiteSettings {
  name: string;
  tagline: string;
  motto: string;
  subheading: string;
  description: string;
  contactEmail: string;
  phone: string;
  address: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  applicationFee: string;
  feeNumeric: number;
  paymentMethods: PaymentMethod[];
}

export interface AnalyticsSummary {
  totalApplications: number;
  pendingCount: number;
  underReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRevenueEtb: number;
  pendingRevenueEtb: number;
  feePerApplicant: number;
  qualificationBreakdown: { qualification: string; count: number; percentage: number }[];
  popularCourses: { courseTitle: string; applicationsCount: number; viewsCount: number }[];
  applicationTrends: { date: string; count: number; cumulative: number }[];
}
