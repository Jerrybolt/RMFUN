const fs = require("fs");
const { publicKey, createSignerFromKeypair, signerIdentity } = require("@metaplex-foundation/umi");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const { mplTokenMetadata, createMetadataAccountV3 } = require("@metaplex-foundation/mpl-token-metadata");

// >>> новый mint <<<
const MINT = "2NpCxS4poUZ55WxNzTat5PDmsg5D168tXwK3KaTdrYmm";

// метаданные
const NAME = "MFUN Clone";
const SYMBOL = "FAKEMFUN";
const URI = "https://ipfs.io/ipfs/bafkreicokeh2ieizqje25jlmlb3ibyumgjnrettncmprmdl67oxdwlce2q";

// ключ из файла
const secret = Uint8Array.from(JSON.parse(fs.readFileSync("/Users/gerardaimontche/mfun-clone.json")));

(async () => {
  const umi = createUmi("https://api.mainnet-beta.solana.com").use(mplTokenMetadata());
  const kp = umi.eddsa.createKeypairFromSecretKey(secret);
  const signer = createSignerFromKeypair(umi, kp);
  umi.use(signerIdentity(signer));

  const mintPk = publicKey(MINT);

  const res = await createMetadataAccountV3(umi, {
    mint: mintPk,
    mintAuthority: signer,
    updateAuthority: signer,
    data: {
      name: NAME,
      symbol: SYMBOL,
      uri: URI,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  }).sendAndConfirm(umi);

  console.log("✅ Metadata CREATED:", res.signature);
})();
