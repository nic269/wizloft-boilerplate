import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
} from "@repo/design-system";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  parameters: {
    layout: "centered",
  },
  title: "Design System/Forms and States",
} satisfies Meta;

export default meta;

export const FormControls: StoryObj<typeof meta> = {
  render: () => (
    <form className="w-[360px] space-y-3 rounded-md border border-border bg-background p-4">
      <label className="block space-y-1" htmlFor="storybook-account-email">
        <span className="font-medium text-sm">Email</span>
        <Input
          id="storybook-account-email"
          placeholder="you@example.com"
          type="email"
        />
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save account</Button>
      </div>
    </form>
  ),
};

export const EmptyAndFeedbackStates: StoryObj<typeof meta> = {
  render: () => (
    <div className="grid w-[520px] gap-4">
      <EmptyState
        action={<Button size="sm">Set up account</Button>}
        description="Complete the account setup to unlock protected features."
        title="Account setup is incomplete"
      />
      <LoadingState label="Checking session status" />
      <ErrorState message="The account could not be loaded." />
    </div>
  ),
};
