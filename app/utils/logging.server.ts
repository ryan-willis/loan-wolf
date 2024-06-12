import { pino } from "pino";
import { singleton } from "./singleton.server";

export const logger = singleton("logger", () => pino({ level: "info" }));
