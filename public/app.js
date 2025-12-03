'use strict';

(function () {
	const { Transaction, Connection } = solanaWeb3;

	// Helper function to decode base64 in browser
	function base64ToUint8Array(base64) {
		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes;
	}

	const connectButton = document.getElementById('connectButton');
	const payButton = document.getElementById('payButton');
	const clientAddressEl = document.getElementById('clientAddress');
	const recipientInput = document.getElementById('recipientInput');
	const amountInput = document.getElementById('amountInput');
	const networkSelect = document.getElementById('networkSelect');
	const statusEl = document.getElementById('status');
	const resultEl = document.getElementById('result');

	let wallet = null;
	let walletPublicKey = null;

	function setStatus(msg, type = 'info') {
		statusEl.textContent = msg || '';
		statusEl.className = `status ${type}`;
	}

	function setResult(html) {
		resultEl.innerHTML = html || '';
	}

	function isPhantomAvailable() {
		return typeof window.solana !== 'undefined' && window.solana.isPhantom;
	}

	async function connectWallet() {
		if (!isPhantomAvailable()) {
			setStatus('❌ Phantom не найден. Установите расширение Phantom.', 'error');
			window.open('https://phantom.app/', '_blank');
			return;
		}
		try {
			wallet = window.solana;
			const resp = await wallet.connect({ onlyIfTrusted: false });
			walletPublicKey = resp.publicKey;
			clientAddressEl.textContent = walletPublicKey.toBase58();
			payButton.disabled = false;
			setStatus('✅ Кошелёк подключен! Теперь введите детали платежа.', 'success');
		} catch (e) {
			setStatus(`❌ Не удалось подключить кошелёк: ${e.message || e}`, 'error');
		}
	}

	connectButton.addEventListener('click', connectWallet);

	async function createUnsignedTxOnServer(sender, recipient, amount, network) {
		const resp = await fetch('/api/create-transfer', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sender: sender.toBase58(),
				recipient: recipient.trim(),
				amount: amount,
				network,
			}),
		});
		if (!resp.ok) {
			const err = await resp.json().catch(() => ({}));
			throw new Error(err.error || `Server error (${resp.status})`);
		}
		return resp.json();
	}

	function explorerTxUrl(signature, network) {
		const base = 'https://explorer.solana.com/tx/';
		if (network === 'devnet') return `${base}${signature}?cluster=devnet`;
		if (network === 'testnet') return `${base}${signature}?cluster=testnet`;
		return `${base}${signature}`;
	}

	payButton.addEventListener('click', async () => {
		setStatus('', 'info');
		setResult('');

		try {
			if (!walletPublicKey) {
				setStatus('❌ Сначала подключите Phantom', 'error');
				return;
			}

			const recipient = recipientInput.value.trim();
			const amount = Number(amountInput.value);
			const network = networkSelect.value;

			if (!recipient) {
				setStatus('❌ Введите адрес получателя', 'error');
				return;
			}
			if (!Number.isFinite(amount) || amount <= 0) {
				setStatus('❌ Введите корректную сумму в SOL', 'error');
				return;
			}

			setStatus('⏳ Создаю транзакцию на сервере...', 'info');
			const serverResp = await createUnsignedTxOnServer(walletPublicKey, recipient, amount, network);

			const { transactionBase64, rpcUrl, network: usedNetwork } = serverResp;

			const tx = Transaction.from(base64ToUint8Array(transactionBase64));

			if (!tx.feePayer || tx.feePayer.toBase58() !== walletPublicKey.toBase58()) {
				throw new Error('Неверный feePayer в транзакции');
			}

			setStatus('⏳ Отправляю запрос в Phantom на подтверждение...', 'info');

			let signature = null;

			try {
				const { signature: sig } = await wallet.signAndSendTransaction(tx);
				signature = sig;
			} catch (walletSendErr) {
				console.warn('signAndSendTransaction failed, fallback to signTransaction + sendRawTransaction', walletSendErr);
				setStatus('⏳ Отправляю через RPC (фоллбек)...', 'info');
				const signed = await wallet.signTransaction(tx);
				const conn = new Connection(rpcUrl, 'confirmed');
				signature = await conn.sendRawTransaction(signed.serialize(), {
					skipPreflight: false,
					preflightCommitment: 'confirmed',
					maxRetries: 3,
				});
			}

			setStatus('⏳ Подтверждаю транзакцию...', 'info');
			try {
				const conn2 = new Connection(rpcUrl, 'confirmed');
				await conn2.confirmTransaction(signature, 'confirmed');
			} catch (e) {
				console.warn('confirmTransaction warning:', e);
			}

			setStatus('✅ Платёж отправлен успешно!', 'success');
			const link = explorerTxUrl(signature, usedNetwork);
			setResult(
				`<div class="tx">
					<strong>Транзакция отправлена!</strong><br>
					Подпись: <a href="${link}" target="_blank" rel="noreferrer noopener">${signature}</a>
				</div>`
			);
		} catch (e) {
			setStatus(`❌ Ошибка: ${e.message || String(e)}`, 'error');
		}
	});
})();


