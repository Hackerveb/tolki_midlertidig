export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface RecordingState {
  status: 'idle' | 'connecting' | 'recording';
  duration: number;
  audioLevel: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
}

export interface Subscription {
  plan: 'Free' | 'Pro' | 'Premium';
  price: number;
  features: string[];
  billingCycle?: 'monthly' | 'yearly';
  active: boolean;
}

export interface BillingHistoryItem {
  id: string;
  date: Date;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export type NavigationParamList = {
  Main: undefined;
  Settings: undefined;
  EditProfile: undefined;
  BuyCredits: undefined;
  BillingHistory: undefined;
  SignIn: undefined;
  SignUp: undefined;
};