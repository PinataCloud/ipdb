import { PinataSDK } from "pinata-web3";
import { createWalletClient, createPublicClient, http } from "viem";
import { base } from "viem/chains";

export const pinata = new PinataSDK({
	pinataJwt: import.meta.env.PINATA_JWT,
	pinataGateway: import.meta.env.PUBLIC_GATEWAY_URL,
});

export const publicClient = createPublicClient({
	chain: base,
	transport: http(import.meta.env.PUBLIC_ALCHEMY_URL),
});

export const walletClient = createWalletClient({
	chain: base,
	transport: http(import.meta.env.PUBLIC_ALCHEMY_URL),
});
