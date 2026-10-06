/* ===== SETUP: choose how appointment requests reach the clinic =====
   1) FORM_ENDPOINT: a form-service URL (e.g. https://formspree.io/f/xxxxxxx). Requests are POSTed as JSON.
   2) CLINIC_EMAIL: used only if FORM_ENDPOINT is empty; opens the visitor's email app with the request filled in. */
const FORM_ENDPOINT = "";
const CLINIC_EMAIL = "";

const $ = id => document.getElementById(id);
const form = $('appointment-form'), formError = $('form-error'), submitButton = $('submit-button'), submitText = $('submit-text');
const menuButton = $('menu-button'), mainNav = $('main-nav');

$('preferred-date').min = new Date().toISOString().split('T')[0];

menuButton.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', String(mainNav.classList.toggle('open')));
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
}));
document.querySelectorAll('a[href="#appointment"]').forEach(a => a.addEventListener('click', () => setTimeout(() => $('full-name').focus({preventScroll:true}), 400)));

const showError = m => { formError.textContent = m; formError.classList.remove('hidden-state'); };
const clearError = () => { formError.textContent = ''; formError.classList.add('hidden-state'); };
const showSuccess = () => { form.classList.add('hidden-state'); $('form-success').classList.remove('hidden-state'); };

form.addEventListener('submit', async e => {
  e.preventDefault(); clearError();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const d = Object.fromEntries(new FormData(form).entries());
  Object.keys(d).forEach(k => d[k] = String(d[k]).trim());
  d.submitted_at = new Date().toISOString();

  if (FORM_ENDPOINT) {
    submitButton.disabled = true; submitText.textContent = 'Sending request…';
    try {
      const r = await fetch(FORM_ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body: JSON.stringify(d) });
      if (!r.ok) throw new Error('bad status');
      showSuccess();
    } catch (err) {
      showError('We could not send your request. Please try again or contact the clinic directly.');
    } finally {
      submitButton.disabled = false; submitText.textContent = 'Send appointment request';
    }
  } else if (CLINIC_EMAIL) {
    const body = `Name: ${d.full_name}\nPhone: ${d.phone}\nEmail: ${d.email}\nService: ${d.service}\nPreferred date: ${d.preferred_date}\n\n${d.message}`;
    location.href = `mailto:${CLINIC_EMAIL}?subject=${encodeURIComponent('Appointment request: ' + d.service)}&body=${encodeURIComponent(body)}`;
    showSuccess();
  } else {
    showError('Appointment requests are not set up yet. Please contact the clinic directly.');
  }
});

$('new-request-button').addEventListener('click', () => {
  form.reset(); clearError();
  $('form-success').classList.add('hidden-state'); form.classList.remove('hidden-state');
  $('full-name').focus();
});

document.addEventListener('DOMContentLoaded', () => lucide.createIcons());
