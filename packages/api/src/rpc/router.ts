import { Hono } from "hono";
import { ApiError } from "../errors";
import { isRpcProcedureId } from "./contract";
import { rpcHandlers } from "./handlers";

export const rpcRouter = new Hono().get("/:procedure", (context) => {
	const procedure = context.req.param("procedure");
	if (!isRpcProcedureId(procedure)) {
		throw new ApiError("RPC_NOT_FOUND", "RPC procedure not found.", 404);
	}

	return context.json({ data: rpcHandlers[procedure]() });
});
