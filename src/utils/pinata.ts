import { PinataSDK } from "pinata-web3";

export const pinata = new PinataSDK({
	pinataJwt: import.meta.env.PINATA_JWT,
	pinataGateway: import.meta.env.PUBLIC_GATEWAY_URL,
});
