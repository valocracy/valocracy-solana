/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "dotenv/config";

import {
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Connection,
    clusterApiUrl
    
} from "@solana/web3.js";
import axios, { AxiosResponse } from "axios";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
//import * as multisig from "@sqds/multisig";
import Squads, { Wallet } from '@sqds/sdk';
import env from "@/config";
import { sleep } from "@/helpers/util";
export default class TreasuryService {
	private balance: number = 0;
	private connection: Connection | undefined;
	private vault_public_key = new PublicKey("Cj4BT6QZbuXp3okUVGeFQdRMxgcqtKJ3U3QzWkhVcfBu");
	private multisig_key = new PublicKey("CAsrU4an3bUKvj7YHCywgzz1ySzgpME9uD6VCgAt3SVJ");
	public is_initialized = false;

	async initialize() {
		await this.getTotalBalance();
		this.is_initialized = true;
	}

	setBalance(balance: number) {
		this.balance = balance;
	}

	deposit(value: number) {
		this.balance += value;
	}

	shareOf(percent: number): number {
		const balance = this.getBalance();
		if(balance === 0) throw Error('Treasury lack funds for withdrawal');

		return balance * percent / 100;
	}

	async withdrawSquad(amount: number,wallet_address: string) {

		console.log('withdrawSquad');

		const valocracy_wallet = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");
		const squads = Squads.devnet(new Wallet(valocracy_wallet));
		const toPubkey = new PublicKey(wallet_address);

		const multisigTransaction = await squads.createTransaction(this.multisig_key, 1);
		const solUSD = await this.getSolanaUSD();

		const transferSolIx = SystemProgram.transfer({
			fromPubkey: this.vault_public_key,
			toPubkey,
			lamports: Math.floor(( amount / solUSD ) * LAMPORTS_PER_SOL),
		});

		await squads.addInstruction(multisigTransaction.publicKey, transferSolIx);
		await squads.activateTransaction(multisigTransaction.publicKey);
		await squads.approveTransaction(multisigTransaction.publicKey);
		await squads.executeTransaction(multisigTransaction.publicKey);

		const postExecuteState = await squads.getTransaction(multisigTransaction.publicKey);

		console.log('PUBLIC KEY',postExecuteState.publicKey);
		
		const hash = await this.getSignature(postExecuteState.publicKey.toBase58(),1);
		console.log({hash});
			
		return {hash:hash};
	}

	async __withdraw(withdrawAmount: number, walletAddress: string) {

		const valocracy_wallet = getKeypairFromEnvironment("SECRET_KEY_WALLET_SOLANA");
		const squads = Squads.devnet(new Wallet(valocracy_wallet));
		const toPubkey = new PublicKey(walletAddress);

		const multisigTransaction = await squads.createTransaction(this.multisig_key, 1);
		const solUSD = await this.getSolanaUSD();

		const transferSolIx = SystemProgram.transfer({
			fromPubkey: this.vault_public_key,
			toPubkey,
			lamports: Math.floor(( withdrawAmount / solUSD ) * LAMPORTS_PER_SOL),
		});

		await squads.addInstruction(multisigTransaction.publicKey, transferSolIx);
		await squads.activateTransaction(multisigTransaction.publicKey);
		await squads.approveTransaction(multisigTransaction.publicKey);
		await squads.executeTransaction(multisigTransaction.publicKey);

		const postExecuteState = await squads.getTransaction(multisigTransaction.publicKey);

		console.log('PUBLIC KEY',postExecuteState.publicKey);
		
		const hash = await this.getSignature(postExecuteState.publicKey.toBase58(),1);
		console.log({hash});
			
		return {hash:hash};
	}

	async withdraw(percent: number, wallet_address: string) {
		const balance = this.getBalance();
		if(balance === 0) throw Error('Treasury lack funds for withdrawal');
		if(!wallet_address) throw Error('Wallet address not found');
		
		const withdrawAmount = balance * percent / 100;
		const withdrawData = await this.__withdraw(Number(withdrawAmount.toFixed(2)), wallet_address);
		this.setBalance(balance - withdrawAmount);

		return { withdraw_amount: withdrawAmount, claim_hash: withdrawData.hash };
		//return { withdraw_amount: withdrawAmount, claim_hash: '' };
	}

	getBalance() {
		return this.balance;
	}

	async getTotalBalance(){
		this.connection = new Connection(clusterApiUrl("devnet"), "confirmed");

		const [solUSD,vaultBalance] = await Promise.all([
			this.getSolanaUSD(),
			this.connection.getBalance(this.vault_public_key, "processed")
		]);

		const solSquadAmout = solUSD * (vaultBalance / LAMPORTS_PER_SOL);

		this.balance = Number(solSquadAmout);

	}

	async getSolanaUSD(){
		console.log(`env.FUNC_SECRET ${env.FUNC_SECRET}`);
		const solUSD = (await axios.get("https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-7e9cd9ca-17a8-4db8-b661-4ad8764bae9e/default/getUSDT", {
			headers: {
				'Content-Type': 'application/json',
				'X-Require-Whisk-Auth': `${env.FUNC_SECRET}`
			}
		})).data.price;

		return parseFloat(Number(solUSD).toFixed(2));			
	}
	
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getSignature = async(address:string, numTx:number, retries = 0): Promise<any> => {
		// this.connection = new Connection("https://docs-demo.solana-devnet.quiknode.pro/");
		try {
			console.log('connecting');
			if(!this.connection) this.connection = new Connection(clusterApiUrl("devnet"), "confirmed");
			const pubKey = new PublicKey(address);
			console.log('getSignaturesForAddress');
			const transactionList = await this.connection.getSignaturesForAddress(pubKey, {limit:numTx});
	
			console.log({transactionList});
			if(transactionList.length > 0) {
				console.log(transactionList[0].signature);
				return transactionList[0].signature;
			}else {
				return '0';
			}
		} catch (error) {
			if(retries < 10) {
				await sleep(5000);
				return await this.getSignature(address, numTx, ++retries);
			}
			else return '0';
		}
	};
}

