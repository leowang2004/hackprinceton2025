// Amazon FlexPay demo logic with upfront installment preview
const payRadios = document.querySelectorAll('input[name="pay"]');
const flexpayDetails = document.getElementById('flexpay-details');
const installmentsList = document.getElementById('installments-list');
const placeOrderBtn = document.getElementById('place-order');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const closeModalBtn = document.getElementById('close-modal');
const retryBtn = document.getElementById('retry-btn');

let usingFlexPay = false;

payRadios.forEach(r => {
  r.addEventListener('change', async () => {
    usingFlexPay = r.value === 'flexpay';
    flexpayDetails.classList.toggle('hidden', !usingFlexPay);
    if (usingFlexPay) {
      await updatePreview();
    }
  });
});

async function updatePreview() {
  try {
    const res = await fetch('/api/get-credit-score');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed preview fetch');
    const offer = data.lendingOffer || {};
    if (offer.status !== 'Approved') {
      installmentsList.innerHTML = '<li>Awaiting approval...</li>';
      return;
    }
    const term = offer.termMonths || 4;
    const monthly = offer.recommendedMonthlyPayment || (214.43 / term);
    const preview = [];
    for (let i = 0; i < Math.min(4, term); i++) {
      const label = i === 0 ? 'Today' : `${i * 30} Days`;
      preview.push(`${label}: $${Number(monthly).toFixed(2)}`);
    }
    installmentsList.innerHTML = preview.map(p => `<li>${p}</li>`).join('');
  } catch (e) {
    installmentsList.innerHTML = '<li>Error loading preview</li>';
  }
}

function openModal() { modal.classList.remove('hidden'); }
function closeModal() { modal.classList.add('hidden'); }
closeModalBtn.addEventListener('click', closeModal);
retryBtn.addEventListener('click', () => {
  document.querySelector('input[value="card"]').checked = true;
  usingFlexPay = false;
  flexpayDetails.classList.add('hidden');
  retryBtn.classList.add('hidden');
  closeModal();
});

placeOrderBtn.addEventListener('click', async () => {
  if (!usingFlexPay) {
    window.location.href = '/amazon-success.html';
    return;
  }
  modalTitle.textContent = 'FlexPay Approval';
  modalMessage.textContent = 'Finalizing plan...';
  retryBtn.classList.add('hidden');
  openModal();
  try {
    const res = await fetch('/api/get-credit-score');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch score');
    const offer = data.lendingOffer || {};
    if (offer.status === 'Approved') {
      modalTitle.textContent = 'Approved ✅';
      modalMessage.innerHTML = `Plan confirmed.<br/>Term: <strong>${offer.termMonths} months</strong><br/>Monthly: <strong>$${Number(offer.recommendedMonthlyPayment).toFixed(2)}</strong><br/>Redirecting...`;
      setTimeout(() => { window.location.href = '/amazon-success.html'; }, 1400);
    } else {
      modalTitle.textContent = 'Declined ❌';
      modalMessage.innerHTML = `FlexPay unavailable.<br/>Score: <strong>${data.creditScore}</strong><br/>Use regular card.`;
      retryBtn.classList.remove('hidden');
    }
  } catch (err) {
    modalTitle.textContent = 'Error';
    modalMessage.textContent = err.message;
    retryBtn.classList.remove('hidden');
  }
});

window.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });
