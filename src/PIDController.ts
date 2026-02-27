export class PIDController {
    private readonly kp: number;
    private readonly ki: number;
    private readonly kd: number;
    private integral: number = 0;
    private previousError: number = 0;
    private engaged: boolean = false;
    private readonly clamp: [number, number]
    private readonly inverse: boolean;

    constructor(kp: number, ki: number, kd: number, clamp: [number, number] = [0, 100], inverse: boolean = false) {
        this.kp = kp;
        this.ki = ki;
        this.kd = kd;
        this.clamp = clamp;
        this.inverse = inverse;
    }

    // input: current value (0-400), setpoint: target value (0-400)
    // returns: output (0-100), where lower output increases input
    update(input: number, setpoint: number, dt: number, currentSetting: number): number {
        let error = setpoint - input;
        if (this.inverse) {
            error *= -1;
        }
        this.integral += error * dt;
        const derivative = (error - this.previousError) / dt;
        const pterm = this.kp * error;
        const iterm = this.ki * this.integral;
        const dterm = this.kd * derivative;
        let output = pterm + iterm + dterm;
        this.previousError = error;
        if (!this.engaged) {
            // if output is within .05 of the current setting, consider the controller engaged and start normal PID control on the next update
            if (Math.abs(output - currentSetting) < 0.05) {
                this.engaged = true;
            } else {
                // avoid startup transients by backfilling the integral term to match the current setting
                // invert the PID calculation to solve for the integral term that would produce backClaculatedOutput given the current error and derivative
                const backCalculatedITerm = currentSetting - pterm - dterm;
                this.integral = backCalculatedITerm / this.ki;
                this.integral -= error * dt; // remove the current error from the integral term to avoid a sudden jump on the next update
                return currentSetting;
            }
        }
        if (output < (this.clamp)[0]) {
            output = (this.clamp)[0];
            // backgrade the integral term to prevent windup
            this.integral = (output - pterm - dterm) / this.ki;
        } else if (output > (this.clamp)[1]) {
            output = (this.clamp)[1];
            // backgrade the integral term to prevent windup
            this.integral = (output - pterm - dterm) / this.ki;
        }
        return output;
    }

    // Expose engaged state for testing purposes
    get isEngaged() {
        return this.engaged;
    }

    reset() {
        this.engaged = false;
        this.integral = 0;
        this.previousError = 0;
    }
}
