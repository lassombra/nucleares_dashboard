export class PIDController {
    private readonly kp: number;
    private readonly ki: number;
    private readonly kd: number;
    private integral: number = 0;
    private previousError: number = 0;
    private engaged: boolean = false;

    constructor(kp: number, ki: number, kd: number) {
        this.kp = kp;
        this.ki = ki;
        this.kd = kd;
    }

    // input: current value (0-400), setpoint: target value (0-400)
    // returns: output (0-100), where lower output increases input
    update(input: number, setpoint: number, dt: number, currentSetting: number): number {
        const error = setpoint - input;
        this.integral += error * dt;
        const derivative = (error - this.previousError) / dt;
        const pterm = this.kp * error;
        const iterm = this.ki * this.integral;
        const dterm = this.kd * derivative;
        let output = this.kp * error + this.ki * this.integral + this.kd * derivative;
        // Invert output so lower output increases input
        output = 100 - Math.max(0, Math.min(100, output));
        this.previousError = error;
        if (!this.engaged) {
            // if output is within .05 of the current setting, consider the controller engaged and start normal PID control on the next update
            if (Math.abs(output - currentSetting) < 0.05) {
                this.engaged = true;
            } else {
                // avoid startup transients by backfilling the integral term to match the current setting
                // current setting is 0-100 but in reverse of the pid calculation, so we need to invert the range again
                // to back calculate the integral term.
                const backCalculatedOutput = 100 - currentSetting;
                // invert the PID calculation to solve for the integral term that would produce backClaculatedOutput given the current error and derivative
                const backCalculatedITerm = backCalculatedOutput - pterm - dterm;
                this.integral = backCalculatedITerm / this.ki;
                this.integral -= error * dt; // remove the current error from the integral term to avoid a sudden jump on the next update
                return currentSetting;
            }
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
