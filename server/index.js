'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const {
	Connection,
	clusterApiUrl,
	PublicKey,
	LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const QRCode = require('qrcode');
const path = require('path');

function getNetworkFromEnv() {
	const fromEnv = (process.env.SOLANA_CLUSTER || '').trim();
	if (fromEnv === 'devnet' || fromEnv === 'testnet' || fromEnv === 'mainnet-beta') {
		return fromEnv;
	}
	return 'testnet'; // Default to testnet
}

function getConnection(preferredNetwork) {
	const network = preferredNetwork || getNetworkFromEnv();
	const rpcUrl = (process.env.SOLANA_RPC_URL || '').trim() || clusterApiUrl(network);
	// confirmed commitment is fine for building transfers
	const connection = new Connection(rpcUrl, 'confirmed');
	return { connection, network, rpcUrl };
}

function parsePositiveNumber(value) {
	const n = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
	if (!Number.isFinite(n) || n <= 0) return null;
	return n;
}

function assertValidPubkey(value, fieldName) {
	try {
		const pk = new PublicKey(value);
		// Additional sanity: ensure input string matches canonical base58 of the key
		if (pk.toBase58() !== value) {
			throw new Error(`Invalid ${fieldName} base58 encoding`);
		}
		return pk;
	} catch (e) {
		const err = new Error(`Invalid ${fieldName} public key`);
		err.statusCode = 400;
		throw err;
	}
}

function toLamports(amountSol) {
	// Using Math.round to avoid floating point residue and ensure integer lamports
	const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
	if (!Number.isFinite(lamports) || lamports <= 0) {
		const err = new Error('Amount must be a positive number of SOL');
		err.statusCode = 400;
		throw err;
	}
	return lamports;
}

const app = express();
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (_req, res) => {
	res.json({ ok: true, network: getNetworkFromEnv() });
});

// Generate Solana Pay URL and QR code for transfer
app.post('/api/create-payment', async (req, res) => {
	try {
		const {
			recipient, // merchant's address
			amount, // amount in SOL
			label, // optional label
			message, // optional message
			memo, // optional memo
			network, // optional: 'devnet' | 'testnet' | 'mainnet-beta'
		} = req.body || {};

		if (!recipient || amount === undefined) {
			return res.status(400).json({
				error: 'Missing required fields: recipient, amount',
			});
		}

		const amountSol = parsePositiveNumber(amount);
		if (!amountSol) {
			return res.status(400).json({ error: 'Amount must be a positive number' });
		}

		const { network: usedNetwork, rpcUrl } = getConnection(network);
		const recipientPubkey = assertValidPubkey(recipient, 'recipient');
		const lamports = toLamports(amountSol);

		// Build Solana Pay transfer request URL
		// Format: solana:<recipient>?amount=<amount>&label=<label>&message=<message>&memo=<memo>
		const params = new URLSearchParams();
		params.append('amount', amountSol.toString());
		
		if (label) params.append('label', label);
		if (message) params.append('message', message);
		if (memo) params.append('memo', memo);

		const solanaPayUrl = `solana:${recipientPubkey.toBase58()}?${params.toString()}`;

		// Generate QR code as data URL
		const qrCodeDataUrl = await QRCode.toDataURL(solanaPayUrl, {
			errorCorrectionLevel: 'M',
			width: 400,
			margin: 2,
		});

		return res.json({
			solanaPayUrl,
			qrCodeDataUrl,
			recipient: recipientPubkey.toBase58(),
			amount: amountSol,
			amountLamports: lamports,
			network: usedNetwork,
			rpcUrl,
			label: label || null,
			message: message || null,
			memo: memo || null,
		});
	} catch (e) {
		const status = e.statusCode || 500;
		return res.status(status).json({
			error: e.message || 'Unexpected error',
		});
	}
});

// Serve the simple client
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on http://localhost:${PORT}`);
});


