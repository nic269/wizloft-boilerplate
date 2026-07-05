import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@repo/design-system";

export default function SignUpPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create account</CardTitle>
					<CardDescription>Email/password auth is enabled by default; Google OAuth is optional by env.</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" method="post">
						<Input autoComplete="name" name="name" placeholder="Full name" />
						<Input autoComplete="email" name="email" placeholder="you@example.com" type="email" />
						<Input autoComplete="new-password" name="password" placeholder="Password" type="password" />
						<Button className="w-full" type="submit">
							Create account
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
