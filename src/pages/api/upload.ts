import type { APIRoute } from "astro";
import { pinata } from "../../utils/pinata";

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
	console.log(IpfsHash);
	const swap = await pinata.gateways.swapCid({
		cid: import.meta.env.PUBLIC_DB_CID,
		swapCid: IpfsHash,
	});
	console.log(swap);
	return new Response(
		JSON.stringify({
			data: swap,
		}),
		{ status: 200 },
	);
};
