export interface UnderdogNFTCreateInterface {
	name: string;
	image: string;
	attributes: {
		rarity: number;
		nature: string;
	};
	receiver?: {
		address: string;
		identifier: string;
	};
	receiverAddress: string;
}

export interface UnderdogNFTCreateResponseInterface {
	transactionId: string;
	nftId: number;
	projectId: number;
}
