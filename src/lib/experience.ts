export type Phase =
  | "intro"
  | "tutorial"
  | "batcomputer"
  | "transition1"
  | "armeria"
  | "transition2"
  | "batmobile"
  | "reveal"
  | "showreel"
  | "checkout"
  | "thankyou";
export type MissionStatus = "idle" | "active" | "failed" | "succeeded";
export interface Order {
  quantity: number;
  total: number;
}
export interface Experience {
  phase: Phase;
  status: MissionStatus;
  completed: number;
  time: number;
  speedrun: boolean;
  order: Order | null;
  run: number;
}
export type Action =
  | { type: "reset" }
  | { type: "tutorial" }
  | { type: "start" }
  | { type: "progress"; count: number }
  | { type: "next" }
  | { type: "fail" }
  | { type: "win"; time: number }
  | { type: "navigate"; phase: "intro" | "showreel" | "checkout" | "thankyou" }
  | { type: "purchase"; order: Order };
export const initialExperience: Experience = {
  phase: "intro",
  status: "idle",
  completed: 0,
  time: 0,
  speedrun: false,
  order: null,
  run: 0,
};
export function experienceReducer(s: Experience, a: Action): Experience {
  switch (a.type) {
    case "reset":
      return { ...initialExperience, run: s.run + 1 };
    case "tutorial":
      return s.phase === "intro" ? { ...s, phase: "tutorial" } : s;
    case "start":
      return s.phase === "tutorial"
        ? {
            ...initialExperience,
            phase: "batcomputer",
            status: "active",
            run: s.run + 1,
          }
        : s;
    case "progress":
      return s.status === "active"
        ? { ...s, completed: Math.max(s.completed, Math.min(5, a.count)) }
        : s;
    case "next":
      return s.status !== "active"
        ? s
        : {
            ...s,
            phase:
              s.phase === "batcomputer"
                ? "transition1"
                : s.phase === "armeria"
                  ? "transition2"
                  : s.phase === "transition1"
                    ? "armeria"
                    : s.phase === "transition2"
                      ? "batmobile"
                      : s.phase,
          };
    case "fail":
      return s.status === "active" ? { ...s, status: "failed" } : s;
    case "win":
      return s.status === "active" && s.completed === 5
        ? {
            ...s,
            status: "succeeded",
            phase: "reveal",
            time: a.time,
            speedrun: a.time > 0 && a.time < 90,
          }
        : s;
    case "navigate": {
      if (a.phase === "thankyou")
        return {
          ...s,
          phase: s.order ? "thankyou" : "showreel",
          status: "idle",
        };
      if (a.phase === "intro") return { ...initialExperience, run: s.run + 1 };
      return {
        ...s,
        phase: a.phase,
        status: s.status === "succeeded" ? "succeeded" : "idle",
      };
    }
    case "purchase":
      return s.phase === "checkout" &&
        Number.isInteger(a.order.quantity) &&
        a.order.quantity >= 1 &&
        a.order.quantity <= 5 &&
        Number.isFinite(a.order.total) &&
        a.order.total > 0
        ? { ...s, phase: "thankyou", order: a.order }
        : s;
  }
}
export function phaseFromHash(
  hash: string,
): "intro" | "showreel" | "checkout" | "thankyou" {
  return hash === "#statua"
    ? "showreel"
    : hash === "#checkout"
      ? "checkout"
      : hash === "#conferma"
        ? "thankyou"
        : "intro";
}
