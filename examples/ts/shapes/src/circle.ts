import { Drawable, Shape } from "./shape";
import { round2 } from "./util";

export class Circle extends Shape implements Drawable {
  constructor(private readonly radius: number) {
    super();
  }

  area(): number {
    return round2(Math.PI * this.radius ** 2);
  }

  draw(): string {
    return `(o r=${this.radius})`;
  }
}
