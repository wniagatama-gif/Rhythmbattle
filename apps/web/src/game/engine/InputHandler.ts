import { LANE_KEYS } from "../constants";

export interface InputCallbacks {
  onLanePress: (lane: number) => void;
  onLaneRelease: (lane: number) => void;
}

export class InputHandler {
  private callbacks: InputCallbacks;
  private attached = false;
  private readonly keyToLane = new Map<string, number>();

  constructor(callbacks: InputCallbacks) {
    this.callbacks = callbacks;
    LANE_KEYS.forEach((key, index) => {
      this.keyToLane.set(key, index);
    });
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const lane = this.keyToLane.get(event.key);
    if (lane === undefined) {
      return;
    }

    event.preventDefault();
    if (event.repeat) {
      return;
    }

    this.callbacks.onLanePress(lane);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    const lane = this.keyToLane.get(event.key);
    if (lane === undefined) {
      return;
    }

    event.preventDefault();
    this.callbacks.onLaneRelease(lane);
  };

  attach(): void {
    if (this.attached) {
      return;
    }
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) {
      return;
    }
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.attached = false;
  }

  triggerPress(lane: number): void {
    this.callbacks.onLanePress(lane);
  }

  triggerRelease(lane: number): void {
    this.callbacks.onLaneRelease(lane);
  }
}

