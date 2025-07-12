export interface Token {
  token: string;
  vector: number[];
}

export interface Step {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  description: string;
}
