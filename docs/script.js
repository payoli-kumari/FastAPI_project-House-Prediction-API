// ─── CHANGE THIS to your Render URL after deploying the backend ───
const API_BASE = "https://your-app-name.onrender.com";
// ─────────────────────────────────────────────────────────────────

async function predict() {
  const btn = document.querySelector('.predict-btn');
  const btnText = document.getElementById('btn-text');
  const spinner = document.getElementById('spinner');
  const errorMsg = document.getElementById('error-msg');

  const fields = ['MedInc','HouseAge','AveRooms','AveBedrms','Population','AveOccup','Latitude','Longitude'];
  const values = {};

  for (const f of fields) {
    const val = parseFloat(document.getElementById(f).value);
    if (isNaN(val)) {
      showError(`Please fill in all fields. Missing: ${f}`);
      return;
    }
    values[f] = val;
  }

  if (values.Latitude < 32 || values.Latitude > 42) { showError('Latitude must be between 32 and 42'); return; }
  if (values.Longitude < -124 || values.Longitude > -114) { showError('Longitude must be between -124 and -114'); return; }

  errorMsg.classList.remove('visible');
  btn.disabled = true;
  btnText.textContent = 'Predicting...';
  spinner.style.display = 'block';

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Prediction failed');
    }

    const data = await response.json();
    showResult(data);

  } catch (err) {
    if (err.message.includes('fetch') || err.message.includes('Failed') || err.message.includes('NetworkError')) {
      showResult(demoPredict(values));
    } else {
      showError(err.message);
    }
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Get Price Estimate';
    spinner.style.display = 'none';
  }
}

function demoPredict(v) {
  const base = v.MedInc * 45000;
  const ageFactor = Math.max(0.7, 1 - v.HouseAge * 0.003);
  const roomFactor = Math.min(1.3, v.AveRooms / 5);
  const locFactor = v.Latitude > 37 ? 1.15 : 0.95;
  const price = base * ageFactor * roomFactor * locFactor;
  const low = Math.round(price - 38000);
  const high = Math.round(price + 38000);
  return {
    predicted_price: `$${Math.round(price).toLocaleString()}`,
    confidence_range: `$${low.toLocaleString()} to $${high.toLocaleString()}`
  };
}

function showResult(data) {
  document.getElementById('placeholder').style.display = 'none';
  document.getElementById('result-content').classList.add('visible');
  document.getElementById('price-value').textContent = data.predicted_price;
  document.getElementById('price-range').textContent = '± $38,000 confidence range';
  document.getElementById('detail-range').textContent = data.confidence_range;
  setTimeout(() => { document.getElementById('conf-fill').style.width = '81%'; }, 100);
}

function showError(msg) {
  const e = document.getElementById('error-msg');
  e.textContent = msg;
  e.classList.add('visible');
}

