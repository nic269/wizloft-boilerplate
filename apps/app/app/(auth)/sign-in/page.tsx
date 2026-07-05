import { AuthForm } from "../auth-form";

const safeCallback = (value?: string) => (value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard");

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
	const { callbackUrl } = await searchParams;
	return (
		<main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
			<AuthForm callbackUrl={safeCallback(callbackUrl)} mode="sign-in" />
		</main>
	);
}
