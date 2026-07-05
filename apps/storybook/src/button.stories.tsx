import { Button } from "@repo/design-system";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
	title: "Design System/Button",
	component: Button,
	args: {
		children: "Save changes",
	},
} satisfies Meta<typeof Button>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
