import type { Clock } from "../../../application/ports/out/Clock.js";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
