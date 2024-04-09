/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Connection,
    clusterApiUrl,
    PublicKey,
    TransactionMessage,
    VersionedTransaction
    
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    createBurnCheckedInstruction,
    getAssociatedTokenAddress,
    
    
} from '@solana/spl-token';
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import "dotenv/config";
import("mocha");

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const my_wallet = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");
const WALLET = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");
const MINT_NFT_ADDRESS = "9UQRnre1ZzuqoEuEAUZT6xqSJGbEKKt3BXCd3no3wAkn";
const MINT_DECIMALS = 0;
const BURN_QUANTITY = 1;

describe("TOKEN 2022", () => {

    console.log(`Attempting to burn ${BURN_QUANTITY} [${MINT_NFT_ADDRESS}] tokens from Owner Wallet: ${WALLET.publicKey.toString()}`);

    it("GET ADDRESS ACCOUNT TOKEN", async () => {

        console.log(`Step 1 - Fetch Token Account`);
        const account = await getAssociatedTokenAddress(new PublicKey(MINT_NFT_ADDRESS), WALLET.publicKey,false,TOKEN_2022_PROGRAM_ID);
        console.log(`    ✅ - Associated Token Account Address: ${account.toString()}`);

        // Step 2 - Create Burn Instructions
        console.log(`\n\nStep 2 - Create Burn Instructions`);
        const burnIx = createBurnCheckedInstruction(
            account, // PublicKey of Owner's Associated Token Account
            new PublicKey(MINT_NFT_ADDRESS), // Public Key of the Token Mint Address
            WALLET.publicKey, // Public Key of Owner's Wallet
            1, // Number of tokens to burn
            MINT_DECIMALS, // Number of Decimals of the Token Mint
            [],
            TOKEN_2022_PROGRAM_ID
        );
        console.log(`    ✅ - Burn Instruction Created`);

        // Step 3 - Fetch Blockhash
        console.log(`\n\nStep 3 - Fetch Blockhash`);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        console.log(`    ✅ - Latest Blockhash: ${blockhash}`);


        // Step 4 - Assemble Transaction
        console.log(`\n\nStep 4 - Assemble Transaction`);
        const messageV0 = new TransactionMessage({
        payerKey: WALLET.publicKey,
        recentBlockhash: blockhash,
        instructions: [burnIx]
        }).compileToV0Message();
        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([WALLET]);
        console.log(`    ✅ - Transaction Created and Signed`);

         // Step 5 - Execute & Confirm Transaction 
        console.log(`Step 5 - Execute & Confirm Transaction`);
        const txid = await connection.sendTransaction(transaction);
        console.log("    ✅ - Transaction sent to network");
        const confirmation = await connection.confirmTransaction({
            signature: txid,
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight
        });

        if (confirmation.value.err) { 
            throw new Error("    ❌ - Transaction not confirmed.");
        }
        console.log('🔥 SUCCESSFUL BURN!🔥', '\n', `https://explorer.solana.com/tx/${txid}?cluster=devnet`);

    });

    // it("INIT", async () => {
        
       

        

    //     const payer = my_wallet;
    //     const authority = my_wallet;
    //     const owner = my_wallet;
    //     const mintKeypair = Keypair.generate();
    //     const mint = mintKeypair.publicKey;

    //     const tokenMetadata: TokenMetadata = {
    //          // A autoridade que pode assinar para atualizar os metadados
    //         updateAuthority: authority.publicKey,
    //         // O mint associado, usado para combater a falsificação para garantir que os metadados pertencem a um mint específico
    //         mint: mint,
    //         name: 'DALE NESSA PORRA',
    //         symbol: 'DALE',
    //         uri: "https://wdbt66u6tirmcsphl45jeyalkhvj5wemkoye5ce7dwlezed5jyga.arweave.net/sMM_ep6aIsFJ5186kmALUeqe2IxTsE6Inx2WTJB9Tgw?ext=jpg",
    //         additionalMetadata: [["Background", "Blue"], ["WrongData", "DeleteMe!"], ["Points", "10"]],
    //     };

    //     const decimals = 0;
    //     const mintAmount = 1;

    //     function generateExplorerUrl(identifier: string, isAddress: boolean = false): string {

    //         if(isAddress) console.log('INDENTIFIER',identifier);

    //         if (!identifier) return '';
    //         const baseUrl = 'https://solana.fm';
    //         const localSuffix = '?cluster=devnet-solana';
    //         const slug = isAddress ? 'address' : 'tx';
    //         return `${baseUrl}/${slug}/${identifier}${localSuffix}`;
    //     }

    //     async function airdropLamports() {
    //         const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    //         await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });
    //     }


    //     async function createTokenAndMint(): Promise<[string, string]> {

    //         const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    //         const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(tokenMetadata).length;
    //         const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    //         // Prepare transaction
    //         const transaction = new Transaction().add(
    //             SystemProgram.createAccount({
    //                 fromPubkey: payer.publicKey,
    //                 newAccountPubkey: mint,
    //                 space: mintLen,
    //                 lamports: mintLamports,
    //                 programId: TOKEN_2022_PROGRAM_ID,
    //             }),
    //             createInitializeMetadataPointerInstruction(
    //                 mint,
    //                 authority.publicKey,
    //                 mint,
    //                 TOKEN_2022_PROGRAM_ID,
    //             ),
    //             createInitializeMintInstruction(
    //                 mint,
    //                 decimals,
    //                 authority.publicKey,
    //                 null,
    //                 TOKEN_2022_PROGRAM_ID,
    //             ),
    //             createInitializeInstruction({
    //                 programId: TOKEN_2022_PROGRAM_ID, 
    //                 metadata: mint,
    //                 updateAuthority: authority.publicKey,
    //                 mint: mint,
    //                 mintAuthority: authority.publicKey, 
    //                 name: tokenMetadata.name,
    //                 symbol: tokenMetadata.symbol,
    //                 uri: tokenMetadata.uri,
    //             }),
    //             createUpdateFieldInstruction({
    //                 programId: TOKEN_2022_PROGRAM_ID,
    //                 metadata: mint,
    //                 updateAuthority: authority.publicKey,
    //                 field: tokenMetadata.additionalMetadata[0][0],
    //                 value: tokenMetadata.additionalMetadata[0][1],
    //             }),
    //             createUpdateFieldInstruction({
    //                 programId: TOKEN_2022_PROGRAM_ID,
    //                 metadata: mint,
    //                 updateAuthority: authority.publicKey,
    //                 field: tokenMetadata.additionalMetadata[1][0],
    //                 value: tokenMetadata.additionalMetadata[1][1],
    //             }),
    //             createUpdateFieldInstruction({
    //                 programId: TOKEN_2022_PROGRAM_ID,
    //                 metadata: mint,
    //                 updateAuthority: authority.publicKey,
    //                 field: tokenMetadata.additionalMetadata[2][0],
    //                 value: tokenMetadata.additionalMetadata[2][1],
    //             }),
        
    //         );

    //         // Calculate the minimum balance for the mint account...
    //         // Prepare the transaction...
    
    //         // Initialize NFT with metadata
    //         const initSig = await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair, authority]);
    //         // Create associated token account
    //         const sourceAccount = await createAssociatedTokenAccountIdempotent(connection, payer, mint, owner.publicKey, {}, TOKEN_2022_PROGRAM_ID);
    //         // Mint NFT to associated token account
    //         const mintSig = await mintTo(connection, payer, mint, sourceAccount, authority, mintAmount, [], undefined, TOKEN_2022_PROGRAM_ID);
    
    //         return [initSig, mintSig];
    
    //     }

    //     async function removeMetadataField() {
    //         const transaction = new Transaction().add(
    //             createRemoveKeyInstruction({
    //                 programId: TOKEN_2022_PROGRAM_ID,
    //                 metadata: mint,
    //                 updateAuthority: authority.publicKey,
    //                 key: 'WrongData',
    //                 idempotent: true,
    //             })
    //         );
    //         const signature = await sendAndConfirmTransaction(connection, transaction, [payer, authority]);
    //         return signature;
    //     }

    //     async function main() {
    //         try {
    //             //await airdropLamports();
                
    //             // 1. Create Token and Mint
    //             const [initSig, mintSig] = await createTokenAndMint();
    //             console.log(`Token created and minted:`);
    //             console.log(`   ${generateExplorerUrl(initSig)}`);
    //             console.log(`   ${generateExplorerUrl(mintSig)}`);
                
    //             // // 2. Remove Metadata Field
    //             const cleanMetaTxId = await removeMetadataField();
    //             // console.log(`Metadata field removed:`);
    //             // console.log(`   ${generateExplorerUrl(cleanMetaTxId)}`);
                
    //             // // 3. Remove Authority
    //             // const removeAuthTxId = await removeTokenAuthority();
    //             // console.log(`Authority removed:`);
    //             // console.log(`   ${generateExplorerUrl(removeAuthTxId)}`);
        
    //             // // 4. Increment Points
    //             //const incrementPointsTxId = await incrementPoints(10);
    //             //console.log(`Points incremented:`);
    //             //console.log(`   ${generateExplorerUrl(incrementPointsTxId)}`);
                
    //             // Log New NFT
    //             console.log('\n\n\n');
    //             console.log(`New NFT:`);
    //             console.log(mint);
    //             console.log(mint.toBase58());
    //             console.log(`   ${mint.toBase58()}`);
    //             console.log(`   ${generateExplorerUrl(mint.toBase58(), true)}`);
    //             console.log('\n\n\n');
                
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     }

    //     await main();

    // });
  
});
