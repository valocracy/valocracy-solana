/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Connection,
    clusterApiUrl
    
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
//import * as multisig from "@sqds/multisig";
import Squads, { Wallet } from '@sqds/sdk';

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

describe("TRANSACTION", () => {

    it("SEND TRANSACTION", async () => {
  
        const my_wallet = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");
        const multisig_key = new PublicKey("CAsrU4an3bUKvj7YHCywgzz1ySzgpME9uD6VCgAt3SVJ");
        const vault_public_key = new PublicKey("Cj4BT6QZbuXp3okUVGeFQdRMxgcqtKJ3U3QzWkhVcfBu");
        const count_test_1_key = new PublicKey("3FdvRyRaTrLgueXpLMTk1yJu9duWeaUdLb2LfDo8rtcr");
        
        const squads = Squads.devnet(new Wallet(my_wallet));

        // console.log('\n-------------- squads --------------\n\n');
        // console.log(squads);
        // console.log('\n\n-------------- squads --------------\n');

        const multisigTransaction = await squads.createTransaction(multisig_key, 1);

        const transferSolIx = SystemProgram.transfer({
            fromPubkey: vault_public_key,
            toPubkey: count_test_1_key,
            lamports: 0.001*LAMPORTS_PER_SOL, 
        });

        // add the instruction to the transaction
        const ixRes = await squads.addInstruction(multisigTransaction.publicKey, transferSolIx);
        console.log('Instruction added to transaction:', JSON.stringify(ixRes));

        // activate the transaction so all members can vote on it
        await squads.activateTransaction(multisigTransaction.publicKey);

        await squads.approveTransaction(multisigTransaction.publicKey);
        const firstTxState = await squads.getTransaction(multisigTransaction.publicKey);
        console.log('Transaction state:', firstTxState.status);

        // now you can also check the transaction state, as it should be "executeReady" as the 2/3 threshold has been met
        const transaction = await squads.getTransaction(multisigTransaction.publicKey);
        console.log('Transaction state:', transaction.status);

        // execute the transaction
        await squads.executeTransaction(multisigTransaction.publicKey);
        const postExecuteState = await squads.getTransaction(multisigTransaction.publicKey);
        console.log('Transaction state:', postExecuteState.status);
        // now we should be able to see that the recipient wallet has a token
        const receipientAccountValue = await squads.connection.getBalance(count_test_1_key, "processed");
        console.log('Recipient token account balance:', receipientAccountValue / LAMPORTS_PER_SOL);
    });


  
});