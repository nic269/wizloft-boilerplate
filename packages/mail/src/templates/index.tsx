import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";

export const InviteUserEmail = ({
	inviterName,
	organizationName,
	inviteUrl,
}: {
	inviterName: string;
	organizationName: string;
	inviteUrl: string;
}) => (
	<Html>
		<Head />
		<Preview>You have been invited to {organizationName}</Preview>
		<Body style={{ fontFamily: "Arial, sans-serif" }}>
			<Container>
				<Heading>Join {organizationName}</Heading>
				<Text>{inviterName} invited you to collaborate.</Text>
				<Link href={inviteUrl}>Accept invitation</Link>
			</Container>
		</Body>
	</Html>
);
