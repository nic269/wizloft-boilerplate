import { DesignSystemProvider } from "@repo/design-system";
import type { Preview } from "@storybook/react";
import "./styles.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <DesignSystemProvider defaultTheme="light" enableSystem={false}>
        <div className="min-h-screen bg-background p-4 text-foreground">
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
