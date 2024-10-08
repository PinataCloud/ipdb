import type { APIRoute } from "astro";
import { pinata, walletClient, publicClient } from "@/utils/config";
import { account } from "@/utils/account";
import { abi } from "@/utils/contract.json";

export const POST: APIRoute = async ({ request }) => {
	const data = await request.formData();
	const file = data.get("file") as File;
	if (!file) {
		return new Response(
			JSON.stringify({
				message: "Missing file",
			}),
			{ status: 400 },
		);
	}
	const { IpfsHash } = await pinata.upload.file(file);
	const { request: contractRequest } = await publicClient.simulateContract({
		account,
		address: import.meta.env.PUBLIC_CONTRACT_ADDRESS as `0x`,
		abi: abi,
		functionName: "update",
		args: [IpfsHash],
	});
	const tx = await walletClient.writeContract(contractRequest);
	const transaction = await publicClient.waitForTransactionReceipt({
		hash: tx,
	});
	return new Response(
		JSON.stringify({
			data: transaction.status,
		}),
		{ status: 200 },
	);
};
