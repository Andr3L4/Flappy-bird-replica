
export enum GameState {
  Menu,
  Playing,
  GameOver,
}

export interface Pipe {
  x: number;
  gapY: number; // The vertical center of the gap
  scored: boolean;
}
