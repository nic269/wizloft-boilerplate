import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import type { Meta, StoryObj } from "@storybook/react";

function ThemeContract() {
  return (
    <main className="flex min-h-screen flex-col gap-4 bg-background p-4 font-sans text-foreground">
      <h1 className="text-xl">Theme contract</h1>
      <p>
        Colors, fonts, spacing, radius and shadows share the same theme root.
      </p>
      <div
        className="rounded-lg bg-card p-4 text-card-foreground shadow-sm"
        data-testid="theme-card"
      >
        Tiếng Việt · Typography and density
      </div>
      <div className="flex flex-wrap gap-4">
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            Open themed dialog
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Theme portal</DialogTitle>
              <DialogDescription>
                This dialog inherits the document theme.
              </DialogDescription>
            </DialogHeader>
            <Button>Portal action</Button>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

const meta = {
  component: ThemeContract,
  parameters: { layout: "fullscreen" },
  title: "Design System/Foundations/Theme",
} satisfies Meta<typeof ThemeContract>;

export default meta;
export const Contract: StoryObj<typeof meta> = {};
