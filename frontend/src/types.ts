export interface User {
  id: string;
  name: string;
  email: string;
  tier: "BASIC" | "PRO";
  createdAt: string;
  password_hash: string;
}

export interface LinkRecord {
  id: string;
  short_code: string;
  original_url: string;
  user_id: string;
  custom_alias: string | null;
  expires_at: string | null;
  createdAt: string;
}

export interface CreateLinkResponse {
  link: {
    link: LinkRecord;
    fullShortUrl: string;
  };
}

export interface GetLinksResponse {
  allLinks: LinkRecord[];
}

export interface AuthResponse {
  message: string;
  user: User;
}
