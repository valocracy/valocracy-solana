/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as multisig from "@sqds/multisig";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionMessage,
  Transaction,
  clusterApiUrl,
  PublicKey,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import("mocha");

const { Permission, Permissions } = multisig.types;


//const createKey = getKeypairFromEnvironment("SECRET_KEY_WALLET_4_SOLANA_TEST");

const multisig_account = "GitVDzWP3Q8LXX4JeQF3rCMs7gzUDWNK3G3Xx5e23e68";
const squads_address = "8X9Vb79u4wNqX8BiLWWA5BzgZmuR9F2y9DEZoYfRZE4u";


describe("Interacting with the Squads V4 SDK", () => {

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const creator = getKeypairFromEnvironment("SECRET_KEY_WALLET_4_SOLANA_TEST");
  const createKey = Keypair.generate();

  console.log('\n\nCREATE KEY',createKey.publicKey,'\n\n');

  // Derive the multisig account PDA
  const [multisigPda] = multisig.getMultisigPda({
    createKey: createKey.publicKey,
  });

  it("Create a new multisig", async () => {

    const programConfigPda = multisig.getProgramConfigPda({})[0];

    console.log("Program Config PDA: ", programConfigPda.toBase58());

    const programConfig =
      await multisig.accounts.ProgramConfig.fromAccountAddress(
        connection,
        programConfigPda
      );

    const configTreasury = programConfig.treasury;

    // Create the multisig
    const signature = await multisig.rpc.multisigCreateV2({
      connection,
      // One time random Key
      createKey,
      // The creator & fee payer
      creator,
      multisigPda,
      configAuthority: null,
      timeLock: 0,
      members: [
        {
          key: creator.publicKey,
          permissions: Permissions.all(),
        },
      ],
      // This means that there needs to be 2 votes for a transaction proposal to be approved
      threshold: 1,
      rentCollector: null,
      treasury: configTreasury,
      sendOptions: { skipPreflight: true },
    });

  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: signature,
  });

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });
    console.log("Multisig created: ", signature);
  });

  it("Create a transaction proposal", async () => {
    
    const [vaultPda] = multisig.getVaultPda({
      multisigPda,
      index: 0,
    });
    const instruction = SystemProgram.transfer({
      // The transfer is being signed from the Squads Vault, that is why we use the VaultPda
      fromPubkey: vaultPda,
      toPubkey: creator.publicKey,
      lamports: 1 * LAMPORTS_PER_SOL,
    });
    // This message contains the instructions that the transaction is going to execute
    const transferMessage = new TransactionMessage({
      payerKey: vaultPda,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
      instructions: [instruction],
    });

    // Get the current multisig transaction index
    const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      connection,
      multisigPda
    );

    const currentTransactionIndex = Number(multisigInfo.transactionIndex);

    const newTransactionIndex = BigInt(currentTransactionIndex + 1);

    const signature1 = await multisig.rpc.vaultTransactionCreate({
      connection,
      feePayer: creator,
      multisigPda,
      transactionIndex: newTransactionIndex,
      creator: creator.publicKey,
      vaultIndex: 0,
      ephemeralSigners: 0,
      transactionMessage: transferMessage,
      memo: "Transfer 0.1 SOL to creator",
    });

    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({

      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature1,

    });

    console.log("Transaction created: ", signature1);

    const signature2 = await multisig.rpc.proposalCreate({
      connection,
      feePayer: creator,
      multisigPda,
      transactionIndex: newTransactionIndex,
      creator,
    });

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature2,
    });

    console.log("Transaction proposal created: ", signature2);
  });

  it("Vote on the created proposal", async () => {
    const transactionIndex =
      await multisig.accounts.Multisig.fromAccountAddress(
        connection,
        multisigPda
      ).then((info) => Number(info.transactionIndex));

    const signature1 = await multisig.rpc.proposalApprove({
      connection,
      feePayer: creator,
      multisigPda,
      transactionIndex: BigInt(transactionIndex),
      member: creator,
    });

    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature1,
    });

  });

  it("Execute the proposal", async () => {
    const transactionIndex =
      await multisig.accounts.Multisig.fromAccountAddress(
        connection,
        multisigPda
      ).then((info) => Number(info.transactionIndex));

    const [proposalPda] = multisig.getProposalPda({
      multisigPda,
      transactionIndex: BigInt(transactionIndex),
    });
    const signature = await multisig.rpc.vaultTransactionExecute({
      connection,
      feePayer: creator,
      multisigPda,
      transactionIndex: BigInt(transactionIndex),
      member: creator.publicKey,
      signers: [creator],
      sendOptions: { skipPreflight: true },
    });

    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });
    console.log("Transaction executed: ", signature);
  });
});


