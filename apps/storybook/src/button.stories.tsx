import { Button } from "@repo/design-system";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  args: {
    children: "Save changes",
  },
  component: Button,
  title: "Design System/Button",
} satisfies Meta<typeof Button>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
