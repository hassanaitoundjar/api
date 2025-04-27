// User account types
export type UserAccountType = 'xtream' | 'm3u';

export interface BaseUserAccount {
  id: string;
  type: UserAccountType;
  playlistName: string;
  lastUsed?: number; // timestamp
}

export interface XtreamUserAccount extends BaseUserAccount {
  type: 'xtream';
  serverUrl: string;
  username: string;
  password: string;
}

export interface M3UUserAccount extends BaseUserAccount {
  type: 'm3u';
  m3uUrl: string;
}

export type UserAccount = XtreamUserAccount | M3UUserAccount;

// Login form validation
export interface XtreamLoginFormValues {
  serverUrl: string;
  username: string;
  password: string;
  playlistName: string;
}

export interface M3ULoginFormValues {
  m3uUrl: string;
  playlistName: string;
}

// API response types
export interface XtreamLoginResponse {
  user_info: {
    auth: number; // 1 for successful auth
    status: string;
    username: string;
    password: string;
    message: string;
    exp_date: string;
    is_trial: string;
    active_cons: string;
    created_at: string;
    max_connections: string;
    allowed_output_formats: string[];
  };
  server_info: {
    url: string;
    port: string;
    https_port: string;
    server_protocol: string;
  };
} 