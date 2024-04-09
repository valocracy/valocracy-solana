/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    SystemProgram,
    LAMPORTS_PER_SOL,
    Connection,
    clusterApiUrl,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
//import * as multisig from "@sqds/multisig";
import Squads, { Wallet } from '@sqds/sdk';
import("mocha");



describe("TRANSACTION", () => {

    it("SEND TRANSACTION", async () => {

        console.log('connection');
        
  
        const getSignature = async(address:string, numTx:number) => {
            console.log('getTransactions');

            //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const connection = new Connection("https://docs-demo.solana-devnet.quiknode.pro/");

            const pubKey = new PublicKey(address);
            const transactionList = await connection.getSignaturesForAddress(pubKey, {limit:numTx});

            console.log({transactionList});

            transactionList.forEach((transaction, i) => {
                //const date = new Date(transaction.blockTime*1000);
                console.log(`Transaction No: ${i+1}`);
                console.log(`Signature: ${transaction.signature}`);
                //console.log(`Time: ${date}`);
                console.log(`Status: ${transaction.confirmationStatus}`);
                console.log(("-").repeat(20));
            });
        };

        await getSignature("7D3wepfnhjqVEnEtgrzUxnsV1zKfYJgYp3QVje2QMXZM",1);

    });

  
});