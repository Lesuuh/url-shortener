import { User } from "../types";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

interface MeResponse {
  user: User;
}
async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: "include",
      ...rest,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Can't reach the server. Check your connection and try again.",
    );
  }

  let data: Record<string, unknown> = {};
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : typeof data.message === "string"
          ? data.message
          : `Request failed (${response.status})`;
    const fields =
      data.errors && typeof data.errors === "object"
        ? (data.errors as Record<string, string>)
        : undefined;
    throw new ApiError(response.status, message, fields);
  }

  return data as T;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<import("../types").AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),

  login: (email: string, password: string) =>
    request<import("../types").AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  me: async (): Promise<User> => {
    const response = await request<MeResponse>("/auth/me", {
      method: "GET",
    });

    return response.user;
  },

  forgotPassword: (email: string) =>
    request<{ message: string }>("/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>("/reset-password", {
      method: "POST",
      body: { token, new_password: newPassword },
    }),

  logout: () =>
    request<{ message: string }>("/auth/logout", { method: "POST" }),

  logoutAll: () =>
    request<{ message: string }>("/auth/logout-all", { method: "POST" }),

  updateProfile: async (data: { name: string; email: string }) => {
    const response = await request<{ user: User }>("/users/me", {
      method: "PATCH",
      body: data,
    });
    return response.user;
  },

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>("/auth/change-password", {
      method: "PATCH",
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
    }),

  deleteAccount: () =>
    request<{ message: string }>("/users/me", { method: "DELETE" }),

  createLink: (url: string, customAlias?: string) =>
    request<import("../types").CreateLinkResponse>("/links/", {
      method: "POST",
      body: customAlias ? { url, custom_alias: customAlias } : { url },
    }),

  myLinks: () =>
    request<import("../types").GetLinksResponse>("/links/my-links"),

  deleteLink: (linkId: string) =>
    request<{ message: string }>(`/links/${linkId}`, { method: "DELETE" }),
};
