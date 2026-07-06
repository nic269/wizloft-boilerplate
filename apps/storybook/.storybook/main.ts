import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  addons: [],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  stories: ["../src/**/*.stories.@(ts|tsx)"],
};

export default config;
