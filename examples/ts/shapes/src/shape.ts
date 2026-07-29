export interface Drawable {
  draw(): string;
}

export abstract class Shape {
  abstract area(): number;

  describe(): string {
    return `area=${this.area()}`;
  }
}
