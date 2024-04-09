/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    SystemProgram,
    Connection,
    clusterApiUrl,
    Keypair,
    sendAndConfirmTransaction,
    Transaction,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {   
    createInitializeMintInstruction,
    createInitializeMintCloseAuthorityInstruction,
    getMintLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    mintToChecked
} from "@solana/spl-token";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import "dotenv/config";
import("mocha");

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

describe("TOKEN 2022", () => {

    it("INIT", async () => {
        
        const my_wallet = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");
        const payer = Keypair.generate();

        const mintKeypair = my_wallet;
        const mint = mintKeypair.publicKey;
        const mintAuthority = my_wallet;
        const freezeAuthority = my_wallet;
        const closeAuthority = my_wallet;
        
        /*PEGA SOLANA E ENVIA PARA CARTEIRA*/
        // const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
        // await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });
        /* ------- */

        const extensions = [ExtensionType.MintCloseAuthority];
        const mintLen = getMintLen(extensions);
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

        console.log({lamports});

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: mint,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMintCloseAuthorityInstruction(mint, closeAuthority.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(
                mint,
                9,
                mintAuthority.publicKey,    //conta autorizada a gerar tokens
                freezeAuthority.publicKey, //conta autorizada a congelar os tokens
                TOKEN_2022_PROGRAM_ID
            )
        );
        await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair], undefined);


    });
  
});
