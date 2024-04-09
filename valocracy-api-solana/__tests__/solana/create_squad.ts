/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import("mocha");
import Squads, { DEFAULT_MULTISIG_PROGRAM_ID, getAuthorityPDA } from '@sqds/sdk';
import {Keypair, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {Wallet} from '@sqds/sdk';
import BN from 'bn.js';
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";


/**
    Successfully created a new multisig at CAsrU4an3bUKvj7YHCywgzz1ySzgpME9uD6VCgAt3SVJ
    Multisig account: {
        "threshold":1,
        "authorityIndex":1,
        "transactionIndex":0,
        "msChangeIndex":0,
        "bump":253,
        "createKey":"AU2EY8bqAvBAqcA21DeLFNP5nT5E3yeaU9mKxSj4ZZ3P",
        "allowExternalExecute":false,
        "keys":["AU2EY8bqAvBAqcA21DeLFNP5nT5E3yeaU9mKxSj4ZZ3P"],
        "publicKey":"CAsrU4an3bUKvj7YHCywgzz1ySzgpME9uD6VCgAt3SVJ"
    }
    Default Vault address: Cj4BT6QZbuXp3okUVGeFQdRMxgcqtKJ3U3QzWkhVcfBu
 */


describe("SOLANA SDK", () => {

  
    it("CREATE SQUAD", async () => {
  
        const my_wallet = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");
        
        const squads = Squads.devnet(new Wallet(my_wallet));
       
        const createKey = my_wallet.publicKey;
        const threshold = 1;
        const members = [my_wallet.publicKey];
        const name = 'Valocracy';
        const description = 'Valocracy';
        
        try {
    
            const multisigAccount = await squads.createMultisig(threshold, createKey, members, name, description);
            console.log("Successfully created a new multisig at", multisigAccount.publicKey.toBase58());
            console.log('Multisig account:', JSON.stringify(multisigAccount));
            const [vault] = await getAuthorityPDA(multisigAccount.publicKey, new BN(1), DEFAULT_MULTISIG_PROGRAM_ID);
            console.log("Default Vault address:", vault.toBase58());

        }catch(e){
            console.log('Error:', e);
        }
  
    });
  
  
  });