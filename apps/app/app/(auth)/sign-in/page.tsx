import { AuthForm } from "../auth-form";

export default function SignInPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
			<AuthForm mode="sign-in" />
		</main>
	);
}
