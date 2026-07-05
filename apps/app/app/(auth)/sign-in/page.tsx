import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@repo/design-system";

export default function SignInPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
					<CardDescription>Better Auth is mounted at the same-origin `/api/auth` rewrite.</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" method="post">
						<Input autoComplete="email" name="email" placeholder="you@example.com" type="email" />
						<Input autoComplete="current-password" name="password" placeholder="Password" type="password" />
						<Button className="w-full" type="submit">
							Sign in
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
