import { Button, EmptyState, ErrorState, Input, LoadingState } from "@repo/design-system";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Design System/Forms and States",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

export const FormControls: StoryObj<typeof meta> = {
  render: () => (
    <form className="w-[360px] space-y-3 rounded-md border border-border bg-background p-4">
      <label className="block space-y-1" htmlFor="storybook-invite-email">
        <span className="font-medium text-sm">Email</span>
        <Input id="storybook-invite-email" placeholder="teammate@example.com" type="email" />
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Send invite</Button>
      </div>
    </form>
  ),
};

export const EmptyAndFeedbackStates: StoryObj<typeof meta> = {
  render: () => (
    <div className="grid w-[520px] gap-4">
      <EmptyState
        action={<Button size="sm">Create invitation</Button>}
        description="Invite teammates when the workspace is ready for collaboration."
        title="No invitations yet"
      />
      <LoadingState label="Syncing provider status" />
      <ErrorState message="The provider is disabled because required environment variables are missing." />
    </div>
  ),
};
