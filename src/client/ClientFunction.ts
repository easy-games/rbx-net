import { DefinitionConfiguration } from "../definitions";
import { getRemoteOrThrow, IS_SERVER, TagId, waitForRemote } from "../internal";
import { ClientCallResult } from "./ClientCallResult";
const CollectionService = game.GetService("CollectionService");

export default class ClientFunction<
	CallArgs extends ReadonlyArray<unknown>,
	ServerReturnType = unknown,
	/** True when the remote has server middleware (global or its own), which may drop calls: results are typed `ServerReturnType | undefined` */
	HasMiddleware extends boolean = false
> {
	private instance: RemoteFunction;

	constructor(private name: string, private configuration: DefinitionConfiguration) {
		this.instance = getRemoteOrThrow("RemoteFunction", name);
		assert(!IS_SERVER, "Cannot create a Net.ClientFunction on the Server!");
	}

	public static Wait<CallArgs extends ReadonlyArray<unknown> = Array<unknown>, ServerReturnType = unknown>(
		name: string,
		configuration: DefinitionConfiguration,
	) {
		return Promise.defer<ClientFunction<CallArgs, ServerReturnType>>(async (resolve) => {
			await waitForRemote("RemoteFunction", name, 60);
			resolve(new ClientFunction(name, configuration));
		});
	}

	/**
	 * Will call the server synchronously
	 *
	 * Typed `ServerReturnType | undefined` when the remote has server middleware, which may drop the call (see ClientCallResult).
	 * @param args The call arguments
	 */
	public CallServer(...args: CallArgs): ClientCallResult<ServerReturnType, HasMiddleware> {
		if (CollectionService.HasTag(this.instance, TagId.DefaultFunctionListener)) {
			throw `Attempted to call Function '${this.name}' - which has no user defined callback`;
		}

		return this.instance.InvokeServer(...args);
	}

	/**
	 * Will call the server asynchronously
	 *
	 * Typed `ServerReturnType | undefined` when the remote has server middleware, which may drop the call (see ClientCallResult).
	 * @param args The call arguments
	 */
	public async CallServerAsync(...args: CallArgs): Promise<ClientCallResult<ServerReturnType, HasMiddleware>> {
		return Promise.defer<ClientCallResult<ServerReturnType, HasMiddleware>>((resolve) => {
			const result = this.instance.InvokeServer(...args) as ClientCallResult<ServerReturnType, HasMiddleware>;
			resolve(result);
		});
	}
}
