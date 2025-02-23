export interface Chart {
  id: number;
  name: string;
  repository: string;
  lob: string;
  registryPath: string;
}

export interface ChartVersion {
  id: number;
  version: string;
  commitSHA: string;
  commitMessage: string;
  createdAt: string;
  promotions: ChartVersionPromotion[];
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
