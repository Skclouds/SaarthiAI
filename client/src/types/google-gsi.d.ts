interface GoogleCredentialResponse {
  credential?: string;
  client_id?: string;
  select_by?: string;
}

interface GoogleGsiButtonConfig {
  type?: string;
  theme?: string;
  size?: string;
  text?: string;
  width?: number;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, config: GoogleGsiButtonConfig) => void;
}

interface Window {
  google?: {
    accounts?: {
      id?: GoogleAccountsId;
    };
  };
}
