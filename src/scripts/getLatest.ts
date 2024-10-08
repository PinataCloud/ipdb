import { publicClient } from "@/utils/config";
import { abi } from "@/utils/contract.json";

(async () => {
	const dbCid = await publicClient.readContract({
		address: import.meta.env.PUBLIC_CONTRACT_ADDRESS,
		abi: abi,
		functionName: "getState",
	});
	console.log(dbCid);
})();
