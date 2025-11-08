// Simple front-end logic for FlexPay demo
const payRadios = document.querySelectorAll('input[name="pay"]');
const flexpayDetails = document.getElementById('flexpay-details');
const placeOrderBtn = document.getElementById('place-order');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const closeModalBtn = document.getElementById('close-modal');
const retryBtn = document.getElementById('retry-btn');

let usingFlexPay = false;

payRadios.forEach(r => {
  r.addEventListener('change', () => {
    usingFlexPay = r.value === 'flexpay';
    flexpayDetails.classList.toggle('hidden', !usingFlexPay);
  });
});

function openModal() { modal.classList.remove('hidden'); }
function closeModal() { modal.classList.add('hidden'); }

closeModalBtn.addEventListener('click', closeModal);
retryBtn.addEventListener('click', () => {
  // Switch back to card payment
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
  // FlexPay path: need approval
  modalTitle.textContent = 'FlexPay Approval';
  modalMessage.textContent = 'Checking eligibility...';
  retryBtn.classList.add('hidden');
  openModal();

  try {
    const res = await fetch('/api/get-credit-score');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch score');

    // Use backend decision for approval
    if (data.lendingOffer && data.lendingOffer.status === 'Approved') {
      modalTitle.textContent = 'Approved ✅';
      modalMessage.innerHTML = `Your FlexPay plan is approved.<br/>Score: <strong>${data.creditScore}</strong><br/>Redirecting to confirmation...`;
      setTimeout(() => {
        window.location.href = '/success.html';
      }, 1500);
    } else {
      modalTitle.textContent = 'Declined ❌';
      modalMessage.innerHTML = `Sorry, FlexPay is unavailable.<br/>Score: <strong>${data.creditScore}</strong><br/>Please choose another payment method.`;
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
