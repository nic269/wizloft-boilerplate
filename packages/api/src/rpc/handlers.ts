import { getHealthPayload, getReadyPayload, getStatusPayload } from "../health";
import type { RpcProcedureId, RpcProcedureOutput } from "./contract";

type RpcHandler<TProcedureId extends RpcProcedureId> = () => RpcProcedureOutput<TProcedureId>;

export const rpcHandlers: { [TProcedureId in RpcProcedureId]: RpcHandler<TProcedureId> } = {
	"status.get": getStatusPayload,
	"health.get": getHealthPayload,
	"ready.get": getReadyPayload,
};
