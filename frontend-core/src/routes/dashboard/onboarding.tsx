import { createFileRoute } from '@tanstack/react-router'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export const Route = createFileRoute('/dashboard/onboarding')({
  component: OnboardingWizard,
})
