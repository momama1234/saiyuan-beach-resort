import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface StepNavigationState {
    currentStep: number
}

export interface StepNavigationActions {
    setCurrentStep: (_step: number) => void
    goToNextStep: () => void
    goToPreviousStep: () => void
}

export interface StepNavigationStore extends StepNavigationState {
    actions: StepNavigationActions
}

export const useStepNavigationStore = create<StepNavigationStore>()(
    devtools(
        (set) => ({
            // State
            currentStep: 1,

            // Actions
            actions: {
                setCurrentStep: (step) => {
                    set({ currentStep: step }, false, 'setCurrentStep')
                },

                goToNextStep: () => {
                    set(
                        (state) => ({
                            currentStep: Math.min(state.currentStep + 1, 3)
                        }),
                        false,
                        'goToNextStep'
                    )
                },

                goToPreviousStep: () => {
                    set(
                        (state) => ({
                            currentStep: Math.max(state.currentStep - 1, 1)
                        }),
                        false,
                        'goToPreviousStep'
                    )
                }
            }
        }),
        { name: 'StepNavigationStore' }
    )
)

// Custom hooks for state
export const useCurrentStep = () => useStepNavigationStore((state) => state.currentStep)

// Custom hook for actions
export const useStepNavigationActions = () => useStepNavigationStore((state) => state.actions)
