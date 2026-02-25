import { PIDController } from "./PIDController";

describe("PIDController", () => {
    let pid: PIDController;
    beforeEach(() => {
        pid = new PIDController(1.5, 0.2, 0.05);
        pid.reset();
    });

    it("should output within 0-100 for typical values", () => {
        const input = 200;
        const setpoint = 250;
        const dt = 1;
        const currentSetting = 50;
        const output = pid.update(input, setpoint, dt, currentSetting);
        expect(output).toBeGreaterThanOrEqual(0);
        expect(output).toBeLessThanOrEqual(100);
    });

    it("should handle input at lower boundary", () => {
        const output = pid.update(0, 400, 1, 50);
        expect(output).toBeGreaterThanOrEqual(0);
        expect(output).toBeLessThanOrEqual(100);
    });

    it("should handle input at upper boundary", () => {
        const output = pid.update(400, 0, 1, 50);
        expect(output).toBeGreaterThanOrEqual(0);
        expect(output).toBeLessThanOrEqual(100);
    });

    it("should not output NaN or Infinity for dt=0", () => {
        const output = pid.update(200, 250, 0, 50);
        expect(output).not.toBeNaN();
        expect(output).not.toBe(Infinity);
        expect(output).not.toBe(-Infinity);
    });

    it("should engage and adjust output as expected", () => {
        let output = pid.update(200, 250, 1, 50);
        for (let i = 0; i < 20; i++) {
            output = pid.update(230 + i * 5, 250, 1, 50);
        }
        expect(output).toBeGreaterThanOrEqual(0);
        expect(output).toBeLessThanOrEqual(100);
    });

    it("should settle towards setpoint over time", () => {
        let control = 50;
        let result = 200;
        for (let i = 0; i < 50; i++) {
            control = pid.update(result, 300, 1, control);
            // Simulate system response to control input with some inertia
            // the system should move twoards the setpoint (300) over time, settling on around 25% control
            result = (result*5 + (400*((100-control) / 100))) / 6;
            result = result + (Math.random()-0.5); // add some slight noise to simulate real-world conditions
        }
        expect(control).toBeGreaterThanOrEqual(24);
        expect(control).toBeLessThanOrEqual(26);
    });
    it ("should backfill integral term and engage as system stabilizes, with the first engaged cycle being within 0.05 of the current setting", () => {
        let control = 29;
        let result = 283;
        for (let i = 0; i < 30 && !pid.isEngaged; i++) {
            control = pid.update(result, 300, 1, control);
            // Simulate system response to control input with some inertia
            result = (result*5 + (400*((100-control) / 100))) / 6;
        }
        expect(pid.isEngaged).toBe(true);
        expect(Math.abs(control - 29)).toBeLessThan(0.15);
    });
});

