import { Tag, Typography } from "antd";
import { KNOWN_USER_SCOPES, type UserProfile } from "@/types/api/user";

const { Text, Title } = Typography;

type ProfileHeaderProps = {
  profile: UserProfile;
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function getScopeTagColor(scopeName: KNOWN_USER_SCOPES): string {
  if (scopeName === KNOWN_USER_SCOPES.SUPERUSER) return "red";
  if (scopeName === KNOWN_USER_SCOPES.ADMIN) return "purple";
  if (scopeName === KNOWN_USER_SCOPES.DEVELOPER) return "blue";
  return "default";
}

function getFullName(profile: UserProfile): string | null {
  const parts = [
    profile.last_name,
    profile.first_name,
    profile.middle_name,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join(" ");
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const avatarLetter = profile.username.charAt(0).toUpperCase();
  const displayName = getFullName(profile) ?? profile.username;

  const metaParts: string[] = [];
  if (profile.equestrian_name) metaParts.push(profile.equestrian_name);
  metaParts.push(`@${profile.username}`);
  metaParts.push(`Зарегистрирован ${formatDate(profile.created_at)}`);
  const metaLine = metaParts.join(" · ");

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 8,
          background: "#1677ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-label={`Аватар пользователя ${profile.username}`}
      >
        <span
          style={{
            color: "#fff",
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {avatarLetter}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Title level={4} style={{ margin: 0 }}>
          {displayName}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {metaLine}
        </Text>
        <div
          style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}
        >
          {profile.scopes.map((scope) => (
            <Tag key={scope.id} color={getScopeTagColor(scope.scope_name)}>
              {scope.scope_name}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}
