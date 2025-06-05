/* eslint-disable @typescript-eslint/no-explicit-any */
// online-courses/types.ts

export type UserRole = 'student' | 'teacher' | 'admin';
export type PlatformAccessTier = 'free' | 'basic' | 'pro' | 'enterprise';
export type AccessTokenEntityType = 'course_access' | 'platform_tier_access';
export type TokenStatus = 'pending' | 'active' | 'expired' | 'revoked';
export type CourseStatus = 'draft' | 'published' | 'archived' | 'pending_review';
export type QuestionType = 'multiple-choice' | 'single-choice' | 'text-input';
export type StudentTestStatus = 'Пройден' | 'На проверке' | 'Предстоит' | 'Неудача';
export type YookassaWebhookPayload = YookassaWebhookNotification;
export type CourseCategory = 'programming' | 'design' | 'marketing' | 'languages' | 'music' | 'other';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentSystemId?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  hashedPassword?: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  platformAccessTier?: PlatformAccessTier;
  studentSlotsAvailable?: number;
  teacherEarnings?: number;
  purchasedCourseIds?: string[];
}

export interface StudentListItem {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: string;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  isPublished: boolean;
  position: number;
  courseId: string;
  isFree?: boolean;
}

export interface Course {
  students: number | undefined;
  id: string;
  title: string;
  description: string;
  instructorId: string;
  price: number;
  currency: string;
  category: CourseCategory;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  chapters: Chapter[];
  studentsEnrolled: number;
  isArchived: boolean;
  rating?: number;
  reviewsCount?: number;
  progress?: number;
  status?: CourseStatus;
  instructor?: string;
  imageUrl?: string;
}

export interface Notification {
  id: number;
  text: string;
  type: 'info' | 'warning' | 'error';
  read?: boolean;
  timestamp?: Date;
}

export interface StudentDashboardData {
  courses: Course[];
  notifications: Notification[];
}

export interface AccessToken {
  id: string;
  token: string;
  userId: string;
  entityType: AccessTokenEntityType;
  entityId: string;
  accessDetails?: {
    studentSlots?: number;
    type?: string;
  };
  status: TokenStatus;
  generatedAt: Date;
  activatedAt?: Date;
  expiresAt?: Date;
  yookassaPaymentId?: string;
}

export interface CreateAccessTokenData {
  userId: string;
  entityType: AccessTokenEntityType;
  entityId: string;
  yookassaPaymentId?: string;
  accessDetails?: {
    studentSlots?: number;
    type?: string;
  };
  expiresAt?: Date;
}

export interface MagicLinkToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

// УДАЛЕНО: ABACResourceType - больше не используется с прямыми проверками в middleware
// export type ABACResourceType = 'dashboard' | 'protected_area' |  'course' |  'api_route' |  'teacher_feature' |
//   'user_role' |  'audit_log' |  'test_list' |  'student_list' | 'ai_recommendations' |  'course_content'  |  'subscription_status'  |  'user_invite'  |  'payment'  |  'generic_protected_resource';

// УДАЛЕНО: ABACContext - больше не используется
// export interface ABACContext {
//   user: User;
//   action: string;
//   resource: {
//     type: ABACResourceType;
//     id?: string;
//     attributes?: { [key: string]: any; path?: string; requiredSlots?: number };
//   };
// }

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  entityType?: 'user' | 'course' | 'payment' | 'subscription' | 'material' | 'admin';
  entityId?: string;
  details?: Record<string, any>;
}

export interface YookassaAmount {
  value: string;
  currency: string;
}

export interface YookassaConfirmation {
  type: 'redirect' | 'embedded' | 'qr';
  return_url?: string;
  confirmation_url?: string;
}

export interface YookassaMetadata {
  [key: string]: string;
}

export interface YookassaPaymentRequestPayload {
  amount: YookassaAmount;
  confirmation: {
    type: 'redirect';
    return_url: string;
  };
  capture: boolean;
  description?: string;
  metadata?: {
    userId?: string;
    courseId?: string;
    scenario: 'student_buys_my_course' | 'teacher_buys_platform_access' | 'student_buys_teacher_course_split';
    teacherId?: string;
    platformAccessTier?: string;
    courseTitle?: string;
    studentEmail?: string;
    [key: string]: any;
  };
  receipt?: {
    customer: {
      email?: string;
      phone?: string;
    };
    items: Array<{
      description: string;
      quantity: string;
      amount: YookassaAmount;
      vat_code?: number;
    }>;
  };
  recipients?: Array<{
    account_id: string;
    amount: YookassaAmount;
    gateway_id: string;
  }>;
}

export interface YookassaPaymentObject {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | 'refunded';
  amount: YookassaAmount;
  description?: string;
  recipient?: {
    account_id: string;
    gateway_id: string;
  };
  payment_method?: {
    type: string;
    id: string;
    saved: boolean;
    title: string;
    card?: {
      first6: string;
      last4: string;
      expiry_month: string;
      expiry_year: string;
      card_type: string;
      issuer_country: string;
      issuer_name: string;
    };
  };
  confirmation: YookassaConfirmation;
  created_at: string;
  expires_at?: string;
  captured_at?: string;
  cancellation_details?: {
    party: 'yookassa' | 'merchant';
    reason: string;
  };
  metadata?: {
    userId?: string;
    courseId?: string;
    scenario?: string;
    teacherId?: string;
    platformAccessTier?: string;
    studentEmail?: string;
    courseTitle?: string;
    [key: string]: any;
  };
  test?: boolean;
  refundable?: boolean;
  receipt_registration?: 'pending' | 'succeeded' | 'canceled';
  recipients?: Array<{
    account_id: string;
    amount: YookassaAmount;
    gateway_id: string;
  }>;
}

export interface YookassaPaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: YookassaAmount;
  confirmation: YookassaConfirmation;
  description?: string;
  metadata?: YookassaMetadata;
  created_at: string;
  expires_at?: string;
  test?: boolean;
  refundable?: boolean;
}

export interface YookassaWebhookNotification {
  event: 'payment.succeeded' | 'payment.canceled' | 'refund.succeeded';
  type: 'notification';
  object: YookassaPaymentObject;
}

export interface Question {
  id: string;
  testId: string;
  text: string;
  type: QuestionType;
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  score: number;
  position: number;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  chapterId?: string;
  isPublished: boolean;
  maxAttempts: number;
  passingScore: number;
  durationMinutes?: number;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentTestOverview {
  id: string;
  title: string;
  course: string;
  status: StudentTestStatus;
  score: string;
}
