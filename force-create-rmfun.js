const fs = require("fs");
const { publicKey, createSignerFromKeypair, signerIdentity } = require("@metaplex-foundation/umi");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const { mplTokenMetadata, createMetadataAccountV3 } = require("@metaplex-foundation/mpl-token-metadata");

const MINT = process.env.MINT; // берём из env
if (!MINT) throw new Error("Set MINT env var first: export MINT=...");

const NAME = "MemeMarket Rebate Token";
const SYMBOL = "RMFUN";
const URI = "https://ipfs.io/ipfs/bafkreif5q3ekdpp4nr3kwksm2tmuznyox5j52kmvw6w2plpoxg6oaquup4";

const secret = Uint8Array.from(JSON.parse(fs.readFileSync("/Users/gerardaimontche/mfun-clone.json")));

(async () => {
  const umi = createUmi("https://api.mainnet-beta.solana.com").use(mplTokenMetadata());
  const kp = umi.eddsa.createKeypairFromSecretKey(secret);
  const signer = createSignerFromKeypair(umi, kp);
  umi.use(signerIdentity(signer));

  const res = await createMetadataAccountV3(umi, {
    mint: publicKey(MINT),
    mintAuthority: signer,
    updateAuthority: signer,
    data: {
      name: NAME,
      symbol: SYMBOL,
      uri: URI,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    },
    isMutable: true,
    collectionDetails: null
  }).sendAndConfirm(umi);

  console.log("✅ RMFUN Metadata CREATED:", res.signature);
})();
