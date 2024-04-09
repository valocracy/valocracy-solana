/* eslint-disable @typescript-eslint/no-explicit-any */
import env from '@/config';
import {
	UnderdogNFTCreateInterface,
} from '@/interfaces/UnderdogNFTInterface';
import api from 'api';
import { Logger } from './LoggerService';
import { sleep } from '@/helpers/util';

class UnderdogService {
	private sdk;

	constructor() {
		this.sdk = api('@underdog/v2.0#5vgec2olujb1d8j');
		this.sdk.auth(env.UNDERDOG_TOKEN);

		this.sdk.server(env.UNDERDOG_BASE_URL);
	}

	public async fetchAllNftData(
		ownerAddress?: string | undefined
	) {
		const projectId = env.UNDERDOG_PROJECT_ID;
		const body: any = { projectId: projectId };

		if (ownerAddress) {
			body.ownerAddress = ownerAddress;
		}
		try {
			const result = await this.sdk.getV2ProjectsProjectidNfts(body);

			return result.data.results;
		} catch (error: any) {
			if (error?.data) {
				Logger.getInstance().error('Underdog[FetchAllNftData]', error.data.message);
			}
			throw error;
		}
	}

	private async fetchNftInfo(nftId: number) {
		try {
			const projectId = env.UNDERDOG_PROJECT_ID;
			const result = await this.sdk.getV2ProjectsProjectidNftsNftid({
				projectId: projectId,
				nftId: nftId,
			});

			return result.data;
		} catch (error: any) {
			if (error?.data) {
				Logger.getInstance().error('Underdog[fetchNftInfo]', error.data.message);
			}
			throw error;
		}
	}

	async fetchUserNfts(ownerAddress: string) {
		const _fetchNftInfo = async (nftData: any) => {
			return await this.fetchNftInfo(nftData.id);
		};

		try {
			const userNftsData: Array<any> = await this.fetchAllNftData(
				ownerAddress
			);
			// console.log('userNftsData', userNftsData);
			const userNftsInfo = await Promise.all(userNftsData.map(_fetchNftInfo));

			return userNftsInfo;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error?.data) {
				Logger.getInstance().error('Underdog[fetchUserNfts]', error.data.message);
			}
			throw error;
		}
	}

	async createNFT(
		data: UnderdogNFTCreateInterface
	): Promise<any> {
		const projectId = env.UNDERDOG_PROJECT_ID;
		const _fetchNftUtilHasMintAddress = async (nftId: number, counter: number = 1): Promise<any> => {
			if(counter === 10) throw Error('Mint address of nft not found');
			const result = await this.fetchNftInfo(nftId).catch(() => {});

			if(!result?.mintAddress) {
				await sleep(1000);
				return await _fetchNftUtilHasMintAddress(nftId, ++counter);
			}
			return result;
		};
		
		try {
			const result = await this.sdk.postV2ProjectsProjectidNfts(
				{ ...data, delegated: false },
				{ projectId: projectId }
			);

			return await _fetchNftUtilHasMintAddress(result.data.nftId);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error?.data) {
				Logger.getInstance().error('Underdog[CreateNFT]', error.data.message);
			}
			throw error;
		}
	}

	async updateNFT(
		newAttributes: any,
		nftId: number
	): Promise<any> {
		const projectId = env.UNDERDOG_PROJECT_ID;
		try {
			await this.sdk.putV2ProjectsProjectidNftsNftid(
				newAttributes,
				{ projectId: projectId, nftId: nftId }
			);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error?.data) {
				Logger.getInstance().error('Underdog[updateNFT]', error.data.message);
			}
			throw error;
		}
	}
}

export default UnderdogService;
