import { PIDController } from '@/PIDController';

export type ApplyCommandFn = (command: number, current: number) => void | Promise<void>;

export type PIDAgentOptions = {
    enabled?: boolean;
    // minimum dt (seconds or ticks) to use to avoid divide-by-zero
    minDt?: number;
}

export class PIDAgent {
    private controller: PIDController;
    private applyFn: ApplyCommandFn;
    private enabled: boolean;
    private applying: boolean = false;
    private minDt: number;

    constructor(controller: PIDController, applyFn: ApplyCommandFn, options: PIDAgentOptions = {}) {
        const { enabled = false, minDt = 1e-3 } = options;
        this.controller = controller;
        this.applyFn = applyFn;
        this.enabled = enabled;
        this.minDt = minDt;
    }

    isEnabled() {
        return this.enabled;
    }

    setEnabled(v: boolean) {
        this.enabled = v;
    }

    reset() {
        this.controller.reset();
    }

    // Replace the underlying PIDController (useful for runtime tuning)
    setController(controller: PIDController) {
        this.controller = controller;
    }

    // cycle: compute new command and optionally apply it using the provided applyFn
    // setpoint: target (0-400), currentValue: measured (0-400), dt: time since last cycle, currentCommand: current output (0-100)
    async cycle(setpoint: number, currentValue: number, dt: number, currentCommand: number): Promise<{ command: number, applied: boolean } | undefined> {
        if (!this.enabled) {
            // reset controller to avoid windup when disabled
            this.controller.reset();
            return { command: currentCommand, applied: false };
        }

        // guard dt
        const safeDt = dt > this.minDt ? dt : this.minDt;

        // compute command using underlying PIDController
        const command = this.controller.update(currentValue, setpoint, safeDt, currentCommand);

        if (this.applying) {
            // if already applying, skip this cycle
            return { command, applied: false };
        }

        this.applying = true;
        try {
            await this.applyFn(command, currentCommand);
            return { command, applied: true };
        } catch (e) {
            // swallow apply errors but report not applied
            console.error('PIDAgent applyFn failed', e);
            return { command, applied: false };
        } finally {
            this.applying = false;
        }
    }
}

export default PIDAgent;

