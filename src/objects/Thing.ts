export interface Thing {
  id: string;
  likes: boolean|null;
  downs: number;
  ups: number;
  score: number;
  typePrefix: string;
}
