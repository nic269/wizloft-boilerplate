export type ProfileName = "core" | "saas";

export interface ProfileManifest {
  defaultApps: string[];
  packages?: string[];
}

export interface ProfileInitManifest {
  defaultProfile: ProfileName;
  optionalApps: string[];
  profiles: Record<ProfileName, ProfileManifest>;
  requiredApps: string[];
}

export interface ResolvedProfile {
  apps: string[];
  packages: string[] | null;
  profile: ProfileName;
}

export const resolveProfile = (
  manifest: ProfileInitManifest,
  input: { apps?: string[]; profile?: string }
): ResolvedProfile => {
  const profileName = input.profile ?? manifest.defaultProfile;
  if (profileName !== "saas" && profileName !== "core") {
    throw new Error(`Unknown generation profile: ${profileName}`);
  }
  const profile = manifest.profiles[profileName];
  if (!profile) {
    throw new Error(`Generation profile is not configured: ${profileName}`);
  }
  const knownApps = new Set([
    ...manifest.requiredApps,
    ...manifest.optionalApps,
  ]);
  const apps = [...new Set(input.apps ?? profile.defaultApps)];
  const unknownApps = apps.filter((app) => !knownApps.has(app));
  if (unknownApps.length > 0) {
    throw new Error(`Unknown app surface(s): ${unknownApps.join(", ")}`);
  }
  const missingApps = manifest.requiredApps.filter(
    (app) => !apps.includes(app)
  );
  if (missingApps.length > 0) {
    throw new Error(
      `Required app surface(s) missing: ${missingApps.join(", ")}`
    );
  }
  return {
    apps,
    packages: profile.packages ? [...profile.packages] : null,
    profile: profileName,
  };
};
