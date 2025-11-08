// Wayfair FlexPay demo logic
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
    const term = offer.termMonths || 12;
    // Parse the total price from the DOM
    const totalText = document.getElementById('total-price').textContent.replace(/[$,]/g, '');
    const total = Number(totalText) || 1020.6;
    const monthly = total / term;
    const preview = [];
    for (let i = 0; i < Math.min(4, term); i++) {
      const label = i === 0 ? 'Today' : `${i * 30} Days`;
      preview.push(`${label}: $${monthly.toFixed(2)}`);
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
    // Regular card checkout success path
    window.location.href = '/success.html';
    return;
  }

  modalTitle.textContent = 'FlexPay Approval';
  modalMessage.textContent = 'Checking eligibility for financing...';
  retryBtn.classList.add('hidden');
  openModal();

  try {
    const res = await fetch('/api/get-credit-score');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch score');

    const offer = data.lendingOffer || {};
    if (offer.status === 'Approved') {
      // Show a plan preview tailored to recommendedMonthlyPayment/termMonths when available
      const term = offer.termMonths || 12;
      const totalText = document.getElementById('total-price').textContent.replace(/[$,]/g, '');
      const total = Number(totalText) || 1020.6;
      const monthly = total / term;

      const preview = [];
      for (let i = 0; i < Math.min(4, term); i++) {
        const label = i === 0 ? 'Today' : `${i * 30} Days`;
        preview.push(`${label}: $${Number(monthly).toFixed(2)}`);
      }
      installmentsList.innerHTML = preview.map(p => `<li>${p}</li>`).join('');
      flexpayDetails.classList.remove('hidden');

      modalTitle.textContent = 'Approved ✅';
      modalMessage.innerHTML = `FlexPay approved.<br/>Term: <strong>${term} months</strong><br/>Est. Monthly: <strong>$${Number(monthly).toFixed(2)}</strong><br/>Redirecting to confirmation...`;
  setTimeout(() => { window.location.href = '/wayfair-success.html'; }, 1500);
    } else {
      modalTitle.textContent = 'Declined ❌';
      modalMessage.innerHTML = `Unable to approve financing at this time.<br/>Score: <strong>${data.creditScore}</strong><br/>Please select a regular card.`;
      retryBtn.classList.remove('hidden');
    }
  } catch (err) {
    modalTitle.textContent = 'Error';
    modalMessage.textContent = err.message;
    retryBtn.classList.remove('hidden');
  }
});

// Accessibility: close on ESC
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });
