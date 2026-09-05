import { appConfig } from "@repo/config";

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-16">
      <h1 className="font-semibold text-4xl">{appConfig.name} documentation</h1>
      <p>
        Start with the generated README, then inspect the{" "}
        <a
          className="underline"
          href={`${process.env.NEXT_PUBLIC_API_URL}/docs/api`}
        >
          API documentation
        </a>
        .
      </p>
    </main>
  );
}
