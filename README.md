## IPDB

This is a conceptual app to build a distributed database with IPFS, smart contracts, and PGlite. Before deploying this app you will need to deploy the contract first which you can find [here](https://github.com/PinataCloud/ipdb-contract). To read more about the concepts and the explanation of this app check out the [blog post]!

## Development

First clone the repo and install dependencies

```
git clone https://github.com/PinataCloud/ipdb && cd ipdb && npm install
```

Rename the `.env.sample` to `.env` and fill out the environment variables.

```
PINATA_JWT= # Your Pinata API key JWT 
PRIVATE_KEY_1= # Private key of the wallet that deployed the contract
PUBLIC_GATEWAY_URL= # Pinata gateway domain 
PUBLIC_CONTRACT_ADDRESS= # Contract address for ipdb-contract
PUBLIC_ALCHEMY_URL= # Alchemy node RPC
```

Once the variables are filled in you can run the following command to run the dev server

```
npm run dev
```

## Deployment

This is an Astro repo that already includes a Vercel adapter for deployment, but you can choose from other deployment options [here](https://docs.astro.build/en/guides/deploy/).
