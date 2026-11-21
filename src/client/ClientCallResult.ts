/*
 * Types for "can a client call to the server come back nil?"
 *
 * Server middleware can drop a call, and a dropped call reaches the client as nil. The types only know whether a remote
 * has middleware, not what it does, so results are typed `T | undefined` whenever the definitions have
 * `ServerGlobalMiddleware` or the remote was declared with its own middleware
 * (`ServerFunction<...>([Net.Middleware.RateLimit(...)])`), and `T` otherwise.
 */

/** What a client call to the server returns */
export type ClientCallResult<T, HasMiddleware extends boolean> = HasMiddleware extends true ? T | undefined : T;

/** True when a definitions configuration has at least one `ServerGlobalMiddleware` (`[]` infers `never[]`: none) */
export type HasServerGlobalMiddleware<C> = C extends { readonly ServerGlobalMiddleware: ReadonlyArray<infer M> }
	? [M] extends [never]
		? false
		: true
	: false;

/** True when the definitions have global middleware, or the remote has its own */
export type HasAnyMiddleware<
	HasGlobalMiddleware extends boolean,
	HasOwnMiddleware extends boolean
> = HasGlobalMiddleware extends true ? true : HasOwnMiddleware;
