/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    clusterApiUrl,
    PublicKey
    
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    mintTo,
    createAssociatedTokenAccountIdempotent,
    AuthorityType,
    createInitializeMetadataPointerInstruction,
    TYPE_SIZE,
    LENGTH_SIZE,
    getMintLen,
    ExtensionType,
    getMint,
    getMetadataPointerState,
    getTokenMetadata,
    createSetAuthorityInstruction,
    
} from '@solana/spl-token';
import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    createRemoveKeyInstruction,
    pack,
    TokenMetadata,
} from '@solana/spl-token-metadata';
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import "dotenv/config";
import("mocha");

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

describe("TOKEN 2022", () => {

    it("INIT", async () => {
        
        const my_wallet = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");

        const payer = my_wallet;
        const authority = my_wallet;
        const owner = my_wallet;
        const mintKeypair = Keypair.generate();
        const mint = mintKeypair.publicKey;
        const from = new PublicKey("GRkDhj9rSM6DKZCp9Nog2rwNDTcdMLr2EPPKwTd4umWF");

        console.log('\n\n ',mint,' \n\n');

        const tokenMetadata: TokenMetadata = {
             // A autoridade que pode assinar para atualizar os metadados
            updateAuthority: authority.publicKey,
            // O mint associado, usado para combater a falsificação para garantir que os metadados pertencem a um mint específico
            mint: mint,
            name: 'DALE NESSA PORRA',
            symbol: 'DALE',
            uri: "https://images.alphacoders.com/133/1330376.png",
            additionalMetadata: [["Background", "Blue"], ["WrongData", "DeleteMe!"], ["Points", "10"]],
        };

        const decimals = 0;
        const mintAmount = 1;

        function generateExplorerUrl(identifier: string, isAddress: boolean = false): string {

            if(isAddress) console.log('INDENTIFIER',identifier);

            if (!identifier) return '';
            const baseUrl = 'https://solana.fm';
            const localSuffix = '?cluster=devnet-solana';
            const slug = isAddress ? 'address' : 'tx';
            return `${baseUrl}/${slug}/${identifier}${localSuffix}`;
        }

        async function airdropLamports() {
            const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
            await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });
        }


        async function createTokenAndMint(): Promise<[string, string]> {

            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(tokenMetadata).length;
            const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

            // Prepare transaction
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: payer.publicKey,
                    newAccountPubkey: mint,
                    space: mintLen,
                    lamports: mintLamports,
                    programId: TOKEN_2022_PROGRAM_ID,
                }),
                createInitializeMetadataPointerInstruction(
                    mint,
                    authority.publicKey,
                    mint,
                    TOKEN_2022_PROGRAM_ID,
                ),
                createInitializeMintInstruction(
                    mint,
                    decimals,
                    authority.publicKey,
                    null,
                    TOKEN_2022_PROGRAM_ID,
                ),
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID, 
                    metadata: mint,
                    updateAuthority: authority.publicKey,
                    mint: mint,
                    mintAuthority: authority.publicKey, 
                    name: tokenMetadata.name,
                    symbol: tokenMetadata.symbol,
                    uri: tokenMetadata.uri,
                }),
                createUpdateFieldInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    metadata: mint,
                    updateAuthority: authority.publicKey,
                    field: tokenMetadata.additionalMetadata[0][0],
                    value: tokenMetadata.additionalMetadata[0][1],
                }),
                createUpdateFieldInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    metadata: mint,
                    updateAuthority: authority.publicKey,
                    field: tokenMetadata.additionalMetadata[1][0],
                    value: tokenMetadata.additionalMetadata[1][1],
                }),
                createUpdateFieldInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    metadata: mint,
                    updateAuthority: authority.publicKey,
                    field: tokenMetadata.additionalMetadata[2][0],
                    value: tokenMetadata.additionalMetadata[2][1],
                }),
        
            );

            // Calculate the minimum balance for the mint account...
            // Prepare the transaction...
    
            // Initialize NFT with metadata
            const initSig = await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair, authority]);
            // Create associated token account
            const sourceAccount = await createAssociatedTokenAccountIdempotent(connection, payer, mint, owner.publicKey, {}, TOKEN_2022_PROGRAM_ID);
            // Mint NFT to associated token account
            const mintSig = await mintTo(connection, payer, mint, sourceAccount, authority, mintAmount, [], undefined, TOKEN_2022_PROGRAM_ID);
    
            return [initSig, mintSig];
    
        }

        async function removeMetadataField() {
            const transaction = new Transaction().add(
                createRemoveKeyInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    metadata: mint,
                    updateAuthority: authority.publicKey,
                    key: 'WrongData',
                    idempotent: true,
                })
            );
            const signature = await sendAndConfirmTransaction(connection, transaction, [payer, authority]);
            return signature;
        }

        async function main() {
            try {
                //await airdropLamports();
                
                // 1. Create Token and Mint
                const [initSig, mintSig] = await createTokenAndMint();
                console.log(`Token created and minted:`);
                console.log(`   ${generateExplorerUrl(initSig)}`);
                console.log(`   ${generateExplorerUrl(mintSig)}`);
                
                // // 2. Remove Metadata Field
                const cleanMetaTxId = await removeMetadataField();
                // console.log(`Metadata field removed:`);
                // console.log(`   ${generateExplorerUrl(cleanMetaTxId)}`);
                
                // // 3. Remove Authority
                // const removeAuthTxId = await removeTokenAuthority();
                // console.log(`Authority removed:`);
                // console.log(`   ${generateExplorerUrl(removeAuthTxId)}`);
        
                // // 4. Increment Points
                //const incrementPointsTxId = await incrementPoints(10);
                //console.log(`Points incremented:`);
                //console.log(`   ${generateExplorerUrl(incrementPointsTxId)}`);
                
                // Log New NFT
                console.log('\n\n\n');
                console.log(`New NFT:`);
                console.log(mint);
                console.log(mint.toBase58());
                console.log(`   ${mint.toBase58()}`);
                console.log(`   ${generateExplorerUrl(mint.toBase58(), true)}`);
                console.log('\n\n\n');
                
            } catch (err) {
                console.error(err);
            }
        }

        await main();

    });
  
});
