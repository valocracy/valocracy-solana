import {
	clusterApiUrl,
	Connection,
	GetProgramAccountsFilter,
} from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const solanaConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const walletToQuery = 'GRkDhj9rSM6DKZCp9Nog2rwNDTcdMLr2EPPKwTd4umWF'; //example: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg

test('Should return wallet nfts', async () => {
	async function getTokenAccounts(wallet, solanaConnection) {
		const filters = [
			{
				memcmp: {
					offset: 9999,     //location of our query in the account (bytes)
					bytes: wallet, //our search criteria, a base58 encoded string
				},
			},
		];
		// 2j43TBB8n9PmsiMRKB9sWxw4RV7NZSsjthBv1c1Kf22e
		const accounts = await solanaConnection.getParsedProgramAccounts(
			TOKEN_2022_PROGRAM_ID, //new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
			{ filters: filters }
		);
		console.log(
			`Found ${accounts.length} token account(s) for wallet ${wallet}.`
		);
		console.log(accounts);
		accounts.forEach((account, i) => {
			//Parse the account data
			const parsedAccountInfo = account.account.data;
			const mintAddress = parsedAccountInfo['parsed']['info']['mint'];
			const tokenBalance =
				parsedAccountInfo['parsed']['info']['tokenAmount']['uiAmount'];
			//Log results
			console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
			console.log(`Token Mint: ${mintAddress}`);
			console.log(`Token Balance: ${tokenBalance}`);
		});
	}
	await getTokenAccounts(walletToQuery, solanaConnection);
});
