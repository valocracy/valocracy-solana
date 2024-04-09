import { Effort } from '@/interfaces/EffortInterface';
import EffortService from './EffortService';
import TreasuryService from './TreasuryService';
import { getErrorMessage } from '@/helpers/response_collection';
import UserMetamaskService from './UserMetamaskService';
import { UserMetamaskInterface } from '@/interfaces/UserMetamaskInterface';
import UnderdogService from './UnderdogService';

export default class EconomyService {
	private treasury: TreasuryService;
	private effortService: EffortService;

	constructor() {
		this.effortService = new EffortService();
		this.treasury = new TreasuryService();
	}

	async getTreasuryBalance() {
		
		await this.initializeTreasure();
		
		return this.treasury.getBalance();
	}

	async deposit(value: number) {

		await this.initializeTreasure();
		
		this.treasury.deposit(value);
	}

	async shareOfUser(id: number): Promise<number> {
		
		await this.initializeTreasure();

		const relEconomicUserPowerPerc = await this.effortService.getRelativeEconomicPowerOfUser(id);

		return this.treasury.shareOf(relEconomicUserPowerPerc);
	}

	async shareOfEffort(id: string): Promise<number> {
		await this.initializeTreasure();

		const relEconomicEffortPowerPerc = await this.effortService.getRelativeEconomicPowerOfEffort(id);

		return this.treasury.shareOf(relEconomicEffortPowerPerc);
	}

	async claimAllOfUser(id: number) {
		const unclaimedEfforts: Array<Effort> = await this.effortService.fetchUnclaimedByUser(id);
		let claimedBalance: number = 0;

		for (const unclaimedEffort of unclaimedEfforts) {
			claimedBalance += await this.claimByEffort(String(unclaimedEffort.id), id);
		}

		return claimedBalance;
	}

	private markNFTAsClaimed = async (economicMintHash: string, userWallet: string) => {
		const underdogService = new UnderdogService();
		try {
			const nfts = await underdogService.fetchUserNfts(userWallet);
			const nft = nfts.find((n) => n.mintAddress === economicMintHash);
	
			if(nft) {
				const newAtts = { ...nft, attributes: {...nft.attributes, is_claimed: 1} };
	
				await underdogService.updateNFT(newAtts, nft.id).catch(console.log);
			}
		} catch (error) {
			console.log(error);
		}
	};

	async claimByEffort(id: string, userAccountId: number) {
		const userMetamaskServce = new UserMetamaskService();
		const effort: Effort | null = await this.effortService.fetch({ id: id });
		if(!effort) throw Error(getErrorMessage('registryNotFound', 'Esforço'));
		if(effort?.is_claimed) throw Error(`Effort [${id}] is already claimed`);
		if(effort.user_account_id !== userAccountId) throw Error(getErrorMessage('solicitedRegistryIsNotYours'));

		await this.initializeTreasure();
		
		const userWalletData: Array<UserMetamaskInterface> = await userMetamaskServce.fetchByUserAccount(userAccountId);
		if(userWalletData.length === 0) throw Error(getErrorMessage('missingUserWalletConnectin'));
		
		const effortRelativePower: number = await this.effortService.getRelativeEconomicPowerOfEffort(id);
		const claimedData = await this.treasury.withdraw(effortRelativePower, String(userWalletData[0].address));
		await this.effortService.claim(claimedData?.withdraw_amount, claimedData?.claim_hash, id);
		await this.markNFTAsClaimed(String(effort.mint_transaction_hash_economy), String(userWalletData[0].address));

		return claimedData?.withdraw_amount;
	}

	async initializeTreasure() {
		if(!this.treasury || !this.treasury.is_initialized) {
			const treasury = new TreasuryService();
			await treasury.initialize();

			this.treasury = treasury;
		}
	}

	async _withdrawSquadTest(amount:number,wallet_address:string) {
		
		await this.initializeTreasure();

		const response = this.treasury.withdrawSquad(amount,wallet_address);

		return response;
	}
}
