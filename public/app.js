'use strict';

(function () {
	const generateButton = document.getElementById('generateButton');
	const recipientInput = document.getElementById('recipientInput');
	const amountInput = document.getElementById('amountInput');
	const labelInput = document.getElementById('labelInput');
	const messageInput = document.getElementById('messageInput');
	const networkSelect = document.getElementById('networkSelect');
	const statusEl = document.getElementById('status');
	const paymentResultEl = document.getElementById('paymentResult');
	const qrCodeImage = document.getElementById('qrCodeImage');
	const solanaPayLink = document.getElementById('solanaPayLink');
	const copyLinkButton = document.getElementById('copyLinkButton');
	const detailRecipient = document.getElementById('detailRecipient');
	const detailAmount = document.getElementById('detailAmount');
	const detailNetwork = document.getElementById('detailNetwork');

	function setStatus(msg, type = 'info') {
		statusEl.textContent = msg || '';
		statusEl.className = `status ${type}`;
	}

	function hidePaymentResult() {
		paymentResultEl.classList.add('hidden');
	}

	function showPaymentResult(data) {
		qrCodeImage.src = data.qrCodeDataUrl;
		solanaPayLink.href = data.solanaPayUrl;
		solanaPayLink.textContent = data.solanaPayUrl;
		detailRecipient.textContent = data.recipient;
		detailAmount.textContent = data.amount;
		detailNetwork.textContent = data.network;
		paymentResultEl.classList.remove('hidden');
	}

	async function createPaymentRequest(recipient, amount, label, message, network) {
		const body = {
			recipient: recipient.trim(),
			amount,
			network,
		};
		if (label) body.label = label.trim();
		if (message) body.message = message.trim();

		const resp = await fetch('/api/create-payment', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		if (!resp.ok) {
			const err = await resp.json().catch(() => ({}));
			throw new Error(err.error || `Server error (${resp.status})`);
		}
		return resp.json();
	}

	generateButton.addEventListener('click', async () => {
		setStatus('', 'info');
		hidePaymentResult();

		try {
			const recipient = recipientInput.value.trim();
			const amount = Number(amountInput.value);
			const label = labelInput.value.trim();
			const message = messageInput.value.trim();
			const network = networkSelect.value;

			if (!recipient) {
				setStatus('Введите адрес получателя', 'error');
				return;
			}
			if (!Number.isFinite(amount) || amount <= 0) {
				setStatus('Введите корректную сумму в SOL', 'error');
				return;
			}

			setStatus('Создаю платёжный запрос...', 'info');
			const data = await createPaymentRequest(recipient, amount, label, message, network);
			
			setStatus('Платёжный запрос создан! Отправьте QR код или ссылку клиенту.', 'success');
			showPaymentResult(data);
		} catch (e) {
			setStatus(e.message || String(e), 'error');
		}
	});

	copyLinkButton.addEventListener('click', async () => {
		try {
			const url = solanaPayLink.href;
			await navigator.clipboard.writeText(url);
			const originalText = copyLinkButton.textContent;
			copyLinkButton.textContent = 'Скопировано!';
			setTimeout(() => {
				copyLinkButton.textContent = originalText;
			}, 2000);
		} catch (e) {
			setStatus('Не удалось скопировать: ' + e.message, 'error');
		}
	});
})();


