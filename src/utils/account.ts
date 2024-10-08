import { privateKeyToAccount } from "viem/accounts";

export const account = privateKeyToAccount(
	import.meta.env.PRIVATE_KEY_1 as `0x`,
);
