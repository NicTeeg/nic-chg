export interface Chart {
  name: string;
  repository: string;
  lob: string;
  registryPath: string;
}

export interface ChartVersion {
  version: string;
  commitSHA: string;
  commitMessage: string;
  createdAt: string;
}

export interface ChartVersionPromotion {
  releaseChannel: string;
  promotedAt: string;
  active: boolean;
}

export interface Repository {
  name: string;
  lob: string;
}
