import { Request, Response } from 'express';

import Controller from './Controller';
import EffortService from '@/services/EffortService';
import { getErrorMessage } from '@/helpers/response_collection';
import { isUserAdm } from '@/helpers/permission_system';
import UserMetamaskService from '@/services/UserMetamaskService';
import { fetchIPFSData } from '@/helpers/util';
import EconomyService from '@/services/EconomyService';

class EffortController extends Controller {
	private service: EffortService;

	constructor() {
		super();
		this.service = new EffortService();
	}

	async fetch(req: Request, res: Response) {
		const getConditionalId = () => {
			if(req.params?.effort_id) return { id: req.params.effort_id };
			else if(req.params?.mint_transaction_hash_economy) return { mint_transaction_hash_economy: req.params.mint_transaction_hash_economy };
			else if(req.params?.mint_transaction_hash_governance) return { mint_transaction_hash_governance: req.params.mint_transaction_hash_governance };
		};

		try {
			const economyService = new EconomyService();
			const effort = await this.service.fetch(getConditionalId());
			const effortShares = await this.service.getEffortShares(effort ? String(effort.id) : '', economyService);

			return this.sendSuccessResponse(res, {
				content: { ...effort, ...effortShares },
			});
		} catch (err) {
			console.log(err);
			this.sendErrorMessage(res, err, 'EffortRarity[FetchAll]');
		}
	}

	async fetchAll(req: Request, res: Response) {
		try {
			const efforts = await this.service.fetchAll();

			return this.sendSuccessResponse(res, { content: efforts });
		} catch (err) {
			console.log(err);
			this.sendErrorMessage(res, err, 'EffortRarity[FetchAll]');
		}
	}

	async fetchSharesOfEffort(req: Request, res: Response) {
		try {
			const economyService = new EconomyService();
			const effortId: string = req.params?.effort_id || '';
			const effortShares = await this.service.getEffortShares(effortId, economyService);

			return this.sendSuccessResponse(res, { content: effortShares });
		} catch (err) {
			console.log(err);
			this.sendErrorMessage(res, err, 'EffortRarity[FetchAll]');
		}
	}

	async fetchNFTsInfo(req: Request, res: Response) {
		const economyService = new EconomyService();
		const _fetchNFTs = async (userId: number | undefined) => {
			// const projectId: number = env.UNDERDOG_PROJECT_ID;

			if(userId) {
				// const userWalletService = new UserMetamaskService();
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				// const [userWallet, userEfforts]: any = await Promise.all([userWalletService.fetchByUserAccount(userId), this.service.fetch({ user_account_id: userId })]);
				
				// const userEconomicNFTs = await underdogService.fetchUserNfts(projectId, String(userWallet[0].address));

				// userEfforts.map(async (effort: Effort) => {
				// 	const effortEconomicNFT = userEconomicNFTs.filter(function (ecoNFTData) {
				// 		return effort.mint_transaction_hash_economy === ecoNFTData.mintAddress;
				// 	});

				// 	if(!effortEconomicNFT) {
				// 		effort.owns_economic_power = false;
				// 		this.service.update({ owns_economic_power: false } as Effort, String(effort.id)).catch;
				// 	}
				// })
				return await this.service.fetchAll({ user_account_id: userId });
			}else {
				return await this.service.fetchAll();
				// return await underdogService.fetchAllNftData(projectId);
			}
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const fetchNFTsExtraData = async (effort: any) => {
			const effortShares = await this.service.getEffortShares(String(effort.id), economyService);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const ipfsData: any = await fetchIPFSData([String(effort.image_url)]).catch((e: any) => {
				console.log(e);
				return [];
			});
			if(ipfsData.length > 0 && ipfsData[0]?.image) effort.image = ipfsData[0].image;
			return { ...effort, ...effortShares, image:  effort.image};
		};

		try {
			const userId = req.query?.user_id ? Number(req.query?.user_id) : undefined;
			const efforts = await _fetchNFTs(userId);

			const effortsNFTs = (await Promise.all(efforts.map(fetchNFTsExtraData)));
			return this.sendSuccessResponse(res, { content: effortsNFTs });
		} catch (err) {
			console.log(err);
			this.sendErrorMessage(res, err, 'EffortRarity[FetchAll]');
		}
	}

	async generateEffort(req: Request, res: Response) {
		try {
			const userId: number = Number(res.locals.jwt.user_id);

			const userWalletService = new UserMetamaskService();
			const userWallet = await userWalletService.fetchByUserAccount(
				req.body.user_account_id
			);
			const effortService = new EffortService();
			// For hackathon purpose only, becouse, for now, only ADM can mint. 
			const userEffort = await effortService.fetchAll({ user_account_id: userId });
			const userIdAdm = await isUserAdm(userId);
			if (!userIdAdm && userEffort.length > 0)
				throw Error(getErrorMessage('userActionNotPermitted'));
			if (userWallet.length === 0)
				throw Error(getErrorMessage('missingUserWalletConnectin'));
			if(!userIdAdm && userEffort.length === 0 && req.body?.effort_rarity_id != 1) throw Error('Apenas mint de raridade "Common Wood" liberado para fins de teste.');
			const effortInfo = await this.service.generateEffort(req.body);

			return this.sendSuccessResponse(res, {
				content: { ...effortInfo, address_to_mint: userWallet[0].address },
			});
		} catch (err) {
			console.log(err);
			this.sendErrorMessage(res, err, 'EffortRarity[FetchAll]');
		}
	}

	async update(req: Request, res: Response) {
		try {
			const userId: number = Number(res.locals.jwt.user_id);
			const effortId: string = req.params.effort_id;

			if (!(await isUserAdm(userId)))
				throw Error(getErrorMessage('userActionNotPermitted'));

			const effortInfo = await this.service.update(req.body, effortId);

			return this.sendSuccessResponse(res, { content: effortInfo });
		} catch (err) {
			console.log(err);
			this.sendErrorMessage(res, err, 'EffortRarity[Update]');
		}
	}
}

export default EffortController;
