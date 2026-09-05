import { healthRouter } from "./health";
import { os } from "./implementer";

export const router = os.router({ health: healthRouter });
