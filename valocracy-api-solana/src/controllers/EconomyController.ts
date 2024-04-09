/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import Controller from './Controller';
import EconomyService from '@/services/EconomyService';
import { EffortClaimPayloadInterface } from '@/interfaces/EffortClaimPayloadInterface';
import EffortService from '@/services/EffortService';

class EconomyController extends Controller {
	private service: EconomyService;

	constructor() {
		super();
		this.service = new EconomyService();
	}

	async fetchMyShare(req: Request, res: Response) {
		try {
			const userId: number = Number(res.locals.jwt.user_id);
			const effortService = new EffortService();

			const myShare = await this.service.shareOfUser(userId);
			const economicPower = await effortService.fetchEconomicPowerOfUser(userId);

			return this.sendSuccessResponse(res, { content: { share: myShare || 0, power: economicPower || 0 } });
		} catch (err) {
			this.sendErrorMessage(res, err, 'EconomyController[fetchMyShare]');
		}
	}

	async fetchShareOfEffort(req: Request, res: Response) {
		try {
			const effortId: string = req.params.effort_id;
		
			const effortShare = await this.service.shareOfEffort(effortId);
			return this.sendSuccessResponse(res, { content: { effort_share: effortShare } });
		} catch (err) {
			this.sendErrorMessage(res, err, 'EconomyController[fetchMyShare]');
		}
	}

	async fetchTreasuryBalance(req: Request, res: Response) {
		try {
			const treasuryBalance = await this.service.getTreasuryBalance();
			return this.sendSuccessResponse(res, { content: { treasury_balance: treasuryBalance } });
		} catch (err) {
			this.sendErrorMessage(res, err, 'EconomyController[fetchTreasuryBalance]');
		}
	}

	async claimByEffort(req: Request, res: Response) {
		try {
			const body: EffortClaimPayloadInterface = req.body;
			const userId: number = Number(res.locals.jwt.user_id);

			const claimedBalance = await this.service.claimByEffort(body.effort_id, userId);

			return this.sendSuccessResponse(res, { content: { claimed_balance: claimedBalance } });
		} catch (err) {
			console.log(err);
			this.sendErrorMessage(res, err, 'EconomyController[claimByEffort]');
		}
	}

	async claimAllEfforts(req: Request, res: Response) {
		try {
			const userId: number = Number(res.locals.jwt.user_id);

			const claimedBalance = await this.service.claimAllOfUser(userId);

			return this.sendSuccessResponse(res, { content: { claimed_balance: claimedBalance } });
		} catch (err) {
			this.sendErrorMessage(res, err, 'EconomyController[claimAllEfforts]');
		}
	}

	async _withdrawSquadTest(req: Request, res: Response) {
		try {

			const amount: number = req.body.amount;
			const wallet_address: string = req.body.wallet_address;

			const treasuryBalance = await this.service._withdrawSquadTest(amount,wallet_address);
			return this.sendSuccessResponse(res, { content: { treasury_balance: treasuryBalance } });
		} catch (err) {
			this.sendErrorMessage(res, err, 'EconomyController[fetchTreasuryBalance]');
		}
	}

}

export default EconomyController;