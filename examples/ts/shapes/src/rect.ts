import { Drawable, Shape } from "./shape";

export class Rect extends Shape implements Drawable {
  constructor(
    private readonly w: number,
    private readonly h: number,
  ) {
    super();
  }

  area(): number {
    return this.w * this.h;
  }

  draw(): string {
    return `[${this.w}x${this.h}]`;
  }
}
