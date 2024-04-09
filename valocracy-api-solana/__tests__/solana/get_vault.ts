/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Connection,
    clusterApiUrl,
    PublicKey
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
//import * as multisig from "@sqds/multisig";
import Squads, { DEFAULT_MULTISIG_PROGRAM_ID, getAuthorityPDA } from '@sqds/sdk';
import BN from 'bn.js';

//const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

describe("VAULT", () => {

    it("GET VAULT", async () => {
  
        const my_wallet = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");
        const multisig_key = new PublicKey("CAsrU4an3bUKvj7YHCywgzz1ySzgpME9uD6VCgAt3SVJ");
        

        const [vault] = await getAuthorityPDA(multisig_key, new BN(1), DEFAULT_MULTISIG_PROGRAM_ID);

        console.log("Default Vault address:", vault.toBase58());

        // const {
        //     Multisig
        // } = multisig.accounts;

        // console.log("CREATE KEY ->",my_wallet.publicKey);
        
        // const [multisigPda] = multisig.getMultisigPda({
        //     createKey:my_wallet.publicKey
        // });

        // console.log("\n\nmultisigPda->",multisigPda);
        
        // const multisigAccount = await Multisig.fromAccountAddress(
        //     connection,
        //     multisigPda
        // );
        
        // console.log("Members", multisigAccount.members);
  
    });
  
});