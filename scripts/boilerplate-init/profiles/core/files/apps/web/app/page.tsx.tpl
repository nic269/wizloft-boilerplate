import { appConfig } from "@repo/config";
import { ArrowRight, Button } from "@repo/design-system";
import { env } from "../env";

export default function WebHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl space-y-6 px-6 py-24">
        <h1 className="font-semibold text-5xl tracking-normal">{appConfig.name}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground leading-8">
          A protected identity foundation ready for product-specific capabilities.
        </p>
        <div className="flex gap-3">
          <Button nativeButton={false} render={<a href={`${env.NEXT_PUBLIC_APP_URL}/sign-up`} />}>
            Create account <ArrowRight data-icon="inline-end" />
          </Button>
          <Button nativeButton={false} render={<a href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`} />} variant="outline">
            Sign in
          </Button>
        </div>
      </section>
    </main>
  );
}
