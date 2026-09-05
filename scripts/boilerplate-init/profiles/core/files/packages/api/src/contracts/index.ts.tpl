export { apiContract } from "./base";
export { healthContract } from "./health";

import { healthContract } from "./health";

export const contract = { health: healthContract };
