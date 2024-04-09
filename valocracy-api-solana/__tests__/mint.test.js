import SolanaService from '@/services/SolanaService';
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import 'dotenv/config';

const solanaService = new SolanaService();
const myKeypair = getKeypairFromEnvironment('SECRET_KEY_WALLET_SOLANA');

beforeAll(() => {
	
});

test('Should mint one token sol22', async () => {
	const hash = await solanaService.mintNFT(myKeypair.publicKey.toBase58(), {
		name: 'Dogging',
		symbol: '',
		uri: 'https://ipfs.io/ipfs/Qmdr6sSBnBuRhW8RASRMDtDJr3Mf4kj1RuxMGnkLsimkR8',
		additionalMetadata: [['local', 'veneza']]
	});

	console.log(hash);
}, 60000);
