const fs = require("fs");
const { publicKey, createSignerFromKeypair, signerIdentity } = require("@metaplex-foundation/umi");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const {
  mplTokenMetadata,
  findMetadataPda,
  createMetadataAccountV3,
  updateMetadataAccountV2,
} = require("@metaplex-foundation/mpl-token-metadata");

// твой новый mint
const MINT = "2NpCxS4poUZ55WxNzTat5PDmsg5D168tXwK3KaTdrYmm";

// метаданные
const NAME = "MFUN Clone";
const SYMBOL = "FAKEMFUN";
const URI = "https://ipfs.io/ipfs/bafkreicokeh2ieizqje25jlmlb3ibyumgjnrettncmprmdl67oxdwlce2q";

// keypair из файла solana
const secret = Uint8Array.from(JSON.parse(fs.readFileSync("/Users/gerardaimontche/mfun-clone.json")));

(async () => {
  const umi = createUmi("https://api.mainnet-beta.solana.com").use(mplTokenMetadata());
  const kp = umi.eddsa.createKeypairFromSecretKey(secret);
  const signer = createSignerFromKeypair(umi, kp);
  umi.use(signerIdentity(signer));

  const mintPk = publicKey(MINT);
  const metadataPda = findMetadataPda(umi, { mint: mintPk });

  // если нет — создадим; если есть — обновим
  const acc = await umi.rpc.getAccount(metadataPda).catch(() => null);

  const data = {
    name: NAME,
    symbol: SYMBOL,
    uri: URI,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  if (!acc) {
    const res = await createMetadataAccountV3(umi, {
      mint: mintPk,
      mintAuthority: signer,
      updateAuthority: signer,
      data,
      isMutable: true,
      collectionDetails: null,
    }).sendAndConfirm(umi);
    console.log("✅ Metadata CREATED:", res.signature);
  } else {
    const res = await updateMetadataAccountV2(umi, {
      metadata: metadataPda,
      updateAuthority: signer,
      data,
      primarySaleHappened: null,
      isMutable: true,
      newUpdateAuthority: signer.publicKey,
    }).sendAndConfirm(umi);
    console.log("✅ Metadata UPDATED:", res.signature);
  }
})();

