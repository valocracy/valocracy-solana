import { Effort, EffortPayload } from '@/interfaces/EffortInterface';
import EffortRarityService from './EffortRarityService';
import EffortNatureService from './EffortNatureService';
import { getErrorMessage } from '@/helpers/response_collection';
import { EffortRarity } from '@/interfaces/EffortRarityInterface';
import { EffortNature } from '@/interfaces/EffortNatureInterface';
import NFTImageService from './NFTImageService';
import pinataService from './PinataService';
import Database from '@/database/Database';
import EffortDatabase from '@/database/EffortDatabase';
import UserService from './UserService';
import { UserAccountInterface } from '@/interfaces/UserAccountInterface';
import { NFTLayerTypeEnum } from '@/enums/NFTLayerTypeEnum';
import NFTOtherLayerInterface from '@/interfaces/NFTOtherLayerInterface';
import { NFTImageFormatTypeEnum } from '@/enums/NFTImageFormatTypeEnum';
import { getDatetimeNow, percentOf } from '@/helpers/util';
import EconomyService from './EconomyService';
import UnderdogService from './UnderdogService';
import UserMetamaskService from './UserMetamaskService';
import SolanaService from './SolanaService';

class EffortService {
	private database: EffortDatabase;

	constructor() {
		this.database = new EffortDatabase();
	}

	private async create(effort: Effort): Promise<string> {
		const effortRarityService = new EffortRarityService();
		const effortNatureService = new EffortNatureService();
		const userService = new UserService();

		const effortRarity: EffortRarity | null = await effortRarityService.fetch(effort?.effort_rarity_id);
		const effortNature: EffortNature | null = await effortNatureService.fetch(effort?.effort_nature_id);
		const user: UserAccountInterface | null = await userService.fetch(effort?.user_account_id);

		if (!effortNature) throw Error(getErrorMessage('registryNotFound', 'natureza'));
		if (!effortRarity) throw Error(getErrorMessage('registryNotFound', 'raridade'));
		if (!user) throw Error(getErrorMessage('registryNotFound', 'usuário'));

		if (!effort?.title) throw Error(getErrorMessage('missingField', 'Titulo do esforço'));
		if (!effort?.text) throw Error(getErrorMessage('missingField', 'Texto do esforço'));
		if (!effort?.effort_rarity_id) throw Error(getErrorMessage('missingField', 'Titulo do esforço'));

		const insertData: Effort = {
			title: effort.title,
			text: effort.text,
			effort_rarity_id: effort.effort_rarity_id,
			effort_nature_id: effort.effort_nature_id,
			user_account_id: effort.user_account_id
		};

		if(effort?.subtitle) insertData.subtitle = effort.subtitle;
		if(effort?.subtitle) insertData.subtitle = effort.subtitle;

		return this.database.create(insertData);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async fetch(ids: any): Promise<Effort | null> {
		if (Object.keys(ids).length === 0) throw Error(getErrorMessage('missingField', 'Id do esforço'));

		return await this.database.fetch(ids);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async fetchAll(ids: any = {}): Promise<Array<Effort>> {
		return await this.database.fetchAll(ids);
	}

	async fetchUnclaimedByUser(id: number): Promise<Array<Effort>> {
		if (!id) throw Error(getErrorMessage('missingField', 'Id do usuário'));

		return await this.database.fetchUnclaimedByUser(id);
	}

	async fetchTotalEconomicPower(): Promise<number> {
		return await this.database.fetchTotalEconomicPower();
	}

	async fetchEconomicPowerOfUser(userAccountId: number): Promise<number> {
		return await this.database.fetchEconomicPowerOfUser(userAccountId);
	}

	async fetchEconomicPowerOfEffort(id: string): Promise<number> {
		return await this.database.fetchEconomicPowerOfEffort(id);
	}

	async getRelativeEconomicPowerOfUser(id: number): Promise<number> {
		const totalPower: number = await this.fetchTotalEconomicPower();
		const userPower: number = await this.fetchEconomicPowerOfUser(id);

		return percentOf(userPower, totalPower);
	}

	async getRelativeEconomicPowerOfEffort(id: string): Promise<number>
	{
		const totalPower: number  = await this.fetchTotalEconomicPower();
		const effortPower: number = await this.fetchEconomicPowerOfEffort(id);			
		console.log('totalPower', totalPower);
		console.log('effortPower', effortPower);
		return percentOf(effortPower, totalPower);
	}

	async fetchTotalGovernancePower(): Promise<number> {
		return await this.database.fetchTotalGovernancePower();
	}

	async fetchGovernancePowerOfUser(id: number): Promise<number> {
		return await this.database.fetchGovernancePowerOfUser(id);
	}

	async fetchGovernancePowerOfEffort(id: string): Promise<number> {
		return Number(await this.database.fetchGovernancePowerOfEffort(id));
	}

	async getRelativeGovernancePowerOfUser(id: number): Promise<number> {
		const totalGovPower = await this.fetchTotalGovernancePower();
		const userGovPower = await this.fetchGovernancePowerOfUser(id);

		return percentOf(userGovPower, totalGovPower);
	}

	async getRelativeGovernancePowerOfEffort(id: string): Promise<number> {
		const totalGovPower = await this.fetchTotalGovernancePower();
		const effortGovPower = await this.fetchGovernancePowerOfEffort(id);

		return percentOf(effortGovPower, totalGovPower);
	}

	async getEffortShares(id: string, economyService: EconomyService) {
		const [ecoShare, ecoRelativePower, ecoPower, govRelativePower, govPower]: Array<number> = await Promise.all([(async () => await economyService.shareOfEffort(id).catch(() => 0))(), this.getRelativeEconomicPowerOfEffort(id), this.fetchEconomicPowerOfEffort(id), this.getRelativeGovernancePowerOfEffort(id), this.fetchGovernancePowerOfEffort(id)]);
		
		return { economy: { share: ecoShare, relative_power: ecoRelativePower, power: ecoPower }, governance: { relative_power: govRelativePower, power: govPower }};
	}

	async __update(data: Effort, id: string) {
		const toUpdate: Effort = {

		} as Effort;
		const effort: Effort | null = await this.fetch({ id: id });

		if(!effort) throw Error(getErrorMessage('registryNotFound', 'esforço'));
		if(effort?.image_url) throw Error(getErrorMessage('efforImageCantBeChanged'));

		toUpdate.image_url = data.image_url;
		if(data?.mint_transaction_hash_governance) toUpdate.mint_transaction_hash_governance = data.mint_transaction_hash_governance;
		if(data?.mint_transaction_hash_economy) toUpdate.mint_transaction_hash_economy = data.mint_transaction_hash_economy;

		if (Object.keys(toUpdate).length === 0) throw Error(getErrorMessage('noValidDataFound'));

		await this.database.update(toUpdate, id);
	}

	async update(data: Effort, id: string) {
		const toUpdate: Effort = {

		} as Effort;
		const effort: Effort | null = await this.fetch({ id: id });

		if(!effort) throw Error(getErrorMessage('registryNotFound', 'esforço'));

		if(data?.mint_transaction_hash_economy) toUpdate.mint_transaction_hash_economy = data.mint_transaction_hash_economy;
		if(data?.owns_economic_power !== undefined) toUpdate.owns_economic_power = data.owns_economic_power;
		
		if (Object.keys(toUpdate).length === 0) throw Error(getErrorMessage('noValidDataFound'));

		await this.database.update(toUpdate, id);
	}

	async claim(claimedBalance: number, hash: string, id: string) {
		const toUpdate: Effort = {

		} as Effort;
		const effort: Effort | null = await this.fetch({ id: id });

		if(!effort) throw Error(getErrorMessage('registryNotFound', 'esforço'));

		if(!claimedBalance) throw Error(getErrorMessage('missingField', 'Valor coletado'));
		if(!hash) throw Error(getErrorMessage('missingField', 'Hash da transação'));

		toUpdate.is_claimed = 1;
		toUpdate.claimed_balance = claimedBalance;
		toUpdate.claim_date = getDatetimeNow();
		toUpdate.claim_transaction_hash = hash;

		if (Object.keys(toUpdate).length === 0) throw Error(getErrorMessage('noValidDataFound'));

		await this.database.update(toUpdate, id);
	}

	async generateEffort(effort: EffortPayload) {
		const effortRarityService = new EffortRarityService();
		const effortNatureService = new EffortNatureService();
		const nftImageService = new NFTImageService();
		const underdogService = new UnderdogService();
		const userWalletService = new UserMetamaskService();
		const solanaService = new SolanaService();

		const effortRarity: EffortRarity | null = await effortRarityService.fetch(effort.effort_rarity_id);
		const effortNature: EffortNature | null = await effortNatureService.fetch(effort.effort_nature_id);

		if (!effortNature) throw Error(getErrorMessage('registryNotFound', 'natureza'));
		if (!effortRarity) throw Error(getErrorMessage('registryNotFound', 'raridade'));

		// const discordService = new DiscordService();
		// discordService.fetchByUserId(effort.user_account_id);
		const userWallet = await userWalletService.fetchByUserAccount(
			effort.user_account_id
		);
		const userWalletAddress = String(userWallet[0].address);

		await Database.startTransaction();
		try {
			const effortId: string = await this.create(effort);
			const imagesLayers: Array<NFTOtherLayerInterface> = [];

			imagesLayers[NFTLayerTypeEnum.BACKGROUND] = {
				image: effort.background_image_base64,
				image_format: NFTImageFormatTypeEnum.BASE_64,
				image_layer: NFTLayerTypeEnum.BACKGROUND,
				// layer_options: {
				// 	width: 820,
				// 	heigth: null,
				// 	top: Math.trunc(1875 / 2 - 381),
				// 	left: Math.trunc(1300 / 2 - 820 / 2)
				// }
			} as NFTOtherLayerInterface;
			// imagesLayers[NFTLayerTypeEnum.NATURE] = {
			// 	image: effortNature.image_url,
			// 	image_format: NFTImageFormatTypeEnum.URL,
			// 	image_layer: NFTLayerTypeEnum.NATURE,
			// 	layer_options: {
			// 		width: 440,
			// 		heigth: null,
			// 		top: 168,
			// 		left: 541
			// 	}
			// } as NFTOtherLayerInterface;
			imagesLayers[NFTLayerTypeEnum.MOLDURE] = {
				image: effortRarity.image_url,
				image_format: NFTImageFormatTypeEnum.URL,
				image_layer: NFTLayerTypeEnum.MOLDURE
			} as NFTOtherLayerInterface;

			await nftImageService.mergeImagesLayers(effortId, effort.text, imagesLayers);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const nftInfo: any = await pinataService.pinNFT({ src: `./tmp/${effortId}.png`, id: effortId, name: effort.title, image_extension: 'png', rarity: effortRarity.weight, nature: effortNature.name});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const economyNFTResult: any = await underdogService.createNFT({
				name: effort.title,
				image: nftInfo.image,
				attributes: {
					rarity: effortRarity.weight,
					nature: effortNature.name
				},
				receiver: {
					address: userWalletAddress,
					identifier: userWalletAddress
				},
				receiverAddress: userWalletAddress,
			});
			const governanceMintHash = await solanaService.mintNFT(userWalletAddress, {
				name: effort.title,
				symbol: '',
				uri: nftInfo.json_data,
				additionalMetadata: [['rarity', effortRarity.weight.toString()]]
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any);

			await this.__update({ image_url: nftInfo.json_data, mint_transaction_hash_governance: governanceMintHash, mint_transaction_hash_economy: economyNFTResult.mintAddress } as Effort, effortId);
			await Database.commit();
			return { effort_id: effortId, rarity: effortRarity.weight, image_url: nftInfo.json_data };
		} catch (error) {
			await Database.rollback().catch(console.log);
			throw error;
		}
	}

}

export default EffortService;