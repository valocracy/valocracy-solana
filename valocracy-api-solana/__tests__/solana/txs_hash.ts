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
    LAMPORTS_PER_SOL,
    PublicKey
} from "@solana/web3.js";
import {   
    createInitializeMintInstruction,
    createInitializeMintCloseAuthorityInstruction,
    createInitializeMetadataPointerInstruction,
    getMintLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    mintToChecked,
    LENGTH_SIZE,
    TYPE_SIZE,
} from "@solana/spl-token";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';
import "dotenv/config";
import("mocha");
import * as multisig from "@sqds/multisig";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

describe("TOKEN 2022", () => {

    it("INIT", async () => {
        
        const createKey = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");

        // Public Key of the Multisig PDA, head to the Multisig Account Info tab to leanrn more
        const multisigPda = new PublicKey(createKey.publicKey);
        
        // Unique index of the transaction you are creating
        const transactionIndex = 1n;
        
        
        const [transactionPda] = multisig.getTransactionPda({
            multisigPda,
            index: transactionIndex,
        });
        
        // Log out the multisig's members
        console.log("transactionPda",transactionPda);
      
    });
  
});
