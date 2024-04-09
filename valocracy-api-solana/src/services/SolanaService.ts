import { generateSolanaExplorerUrl } from '@/helpers/util';
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import { clusterApiUrl, Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction, TransactionInstructionCtorFields } from '@solana/web3.js';
// import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createAssociatedTokenAccountIdempotent: any, createInitializeMetadataPointerInstruction: any, createInitializeMintInstruction: any, createInitializeNonTransferableMintInstruction: any, createUpdateFieldInstruction: any, ExtensionType: any, getMintLen: any, LENGTH_SIZE: any, mintTo: any, TOKEN_2022_PROGRAM_ID: any, TYPE_SIZE: any;
import('@solana/spl-token')
	.then((splToken) => {
		createAssociatedTokenAccountIdempotent = splToken.createAssociatedTokenAccountIdempotent;
		createInitializeMetadataPointerInstruction = splToken.createInitializeMetadataPointerInstruction;
		createInitializeMintInstruction = splToken.createInitializeMintInstruction;
		createInitializeNonTransferableMintInstruction = splToken.createInitializeNonTransferableMintInstruction;
		createUpdateFieldInstruction = splToken.createUpdateFieldInstruction;
		ExtensionType = splToken.ExtensionType;
		getMintLen = splToken.getMintLen;
		LENGTH_SIZE = splToken.LENGTH_SIZE;
		mintTo = splToken.mintTo;
		TOKEN_2022_PROGRAM_ID = splToken.TOKEN_2022_PROGRAM_ID;
		TYPE_SIZE = splToken.TYPE_SIZE;
	}).catch((error) => console.error('Failed to load module:', error));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createInitializeInstruction: ((args: any) => TransactionInstruction) | ((arg0: { programId: PublicKey; metadata: PublicKey; updateAuthority: PublicKey; mint: PublicKey; mintAuthority: PublicKey; name: any; symbol: any; uri: any; }) => Transaction | TransactionInstruction | TransactionInstructionCtorFields), pack: ((meta: any) => Uint8Array) | ((arg0: any) => { (): any; new(): any; length: number; });

import('@solana/spl-token-metadata')
	.then((splTokenMetadata) => {
		createInitializeInstruction = splTokenMetadata.createInitializeInstruction;
		pack = splTokenMetadata.pack;
	}).catch((error) => console.error('Failed to load module:', error));

import 'dotenv/config';

class SolanaService {
	private payer: Keypair;
	private authority: Keypair;
	private connection: Connection;

	constructor() {
		const keypair = getKeypairFromEnvironment('SECRET_KEY_WALLET_SOLANA');
		this.payer = keypair;
		this.authority = keypair;
		this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async mintNFT(to: string, metadata: any) {
		const mintKP = Keypair.generate();
		metadata.mint = mintKP.publicKey;
		metadata.updateAuthority = this.authority.publicKey;
		const decimals = 0;
		const ownerPublicK = new PublicKey(to);
		const mintLen = getMintLen([ExtensionType.MetadataPointer, ExtensionType.NonTransferable]);
		const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
		const mintLamports = await this.connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
		const mint = mintKP.publicKey;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const _createUpdateFieldInstruction = (extraMetadata: Array<any>) => {
			return createUpdateFieldInstruction({
				programId: TOKEN_2022_PROGRAM_ID,
				metadata: mint,
				updateAuthority: this.authority.publicKey,
				field: extraMetadata[0],
				value: extraMetadata[1],
			});
		};

		const transaction = new Transaction().add(
			SystemProgram.createAccount({
				fromPubkey: this.payer.publicKey,
				newAccountPubkey: mint,
				space: mintLen,
				lamports: mintLamports,
				programId: TOKEN_2022_PROGRAM_ID,
			}),
			createInitializeMetadataPointerInstruction(
				mint,
				this.authority.publicKey,
				mint,
				TOKEN_2022_PROGRAM_ID,
			),
			createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
			createInitializeMintInstruction(
				mint,
				decimals,
				this.authority.publicKey,
				null,
				TOKEN_2022_PROGRAM_ID,
			),
			createInitializeInstruction({
				programId: TOKEN_2022_PROGRAM_ID, 
				metadata: mint,
				updateAuthority: this.authority.publicKey,
				mint: mint,
				mintAuthority: this.authority.publicKey, 
				name: metadata.name,
				symbol: metadata.symbol,
				uri: metadata.uri,
			}),
			...metadata.additionalMetadata.map(_createUpdateFieldInstruction)
		);

		const initSig = await sendAndConfirmTransaction(this.connection, transaction, [this.payer, mintKP, this.authority]);

		// Create associated token account
		const sourceAccount = await createAssociatedTokenAccountIdempotent(this.connection, this.payer, mint, ownerPublicK, {}, TOKEN_2022_PROGRAM_ID);
		console.log('associated token account', sourceAccount);

		// Mint NFT to associated token account
		const mintSig = await mintTo(this.connection, this.payer, mint, sourceAccount, this.authority, 1, [], undefined, TOKEN_2022_PROGRAM_ID);

		console.log(generateSolanaExplorerUrl(initSig));
		console.log(generateSolanaExplorerUrl(mintSig));
		console.log(generateSolanaExplorerUrl(mint.toBase58(), true));

		return mint.toBase58();
	}
}

export default SolanaService;
