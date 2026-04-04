export interface NavLink {
  label: string;
  href: string;
}

export interface Testimonial {
  name: string;
  role: string;
  avatarUrl: string;
  quote: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
}

export interface SignupFormState {
  name: string;
  email: string;
  phone: string;
  currentStep: number;
}
