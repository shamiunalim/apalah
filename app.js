const $ = (id) => document.getElementById(id);
const state = { published: [], drafts: [], editId: null };
const STORE_KEY = 'maxiel-domain-control-drafts-v1';
const validName = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
let toastTimer;
function safeUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
}
function normalizeRecord(row) {
  if (!row || typeof row !== 'object') return null;
  const name = String(row.name || '').trim().toLowerCase();
  const target = String(row.target || '').trim();
  if (!validName.test(name) || !safeUrl(target)) return null;
  return { id: name, name, target: new URL(target).href, description: String(row.description || '').slice(0, 100) };
}
function readDrafts() {
  try { const x = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); return Array.isArray(x) ? x.map(normalizeRecord).filter(Boolean) : []; }
  catch { return []; }
}
function saveDrafts() { localStorage.setItem(STORE_KEY, JSON.stringify(state.drafts)); }
async function loadPublished() {
  try {
    const response = await fetch('./domains.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Tidak dapat memuat domains.json');
    const data = await response.json();
    state.published = Array.isArray(data.domains) ? data.domains.map(normalizeRecord).filter(Boolean) : [];
  } catch (err) {
    state.published = [];
    $('listSub').textContent = 'Daftar publik belum dapat dimuat; draft lokal tetap tersedia.';
  }
}
function allRecords() {
  const map = new Map(state.published.map(x => [x.name, {...x, published: true}]));
  for (const d of state.drafts) if (!map.has(d.name)) map.set(d.name, {...d, published: false});
  return [...map.values()].sort((a,b) => a.name.localeCompare(b.name));
}
function showToast(text) {
  const el = $('toast'); el.textContent = text; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
}
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function redirectUrl(name) {
  const url = new URL(location.href); url.hash = ''; url.search = '?go=' + encodeURIComponent(name); return url.href;
}
function render() {
  const records = allRecords(); const query = $('searchInput').value.trim().toLowerCase();
  $('statPublished').textContent = state.published.length;
  $('statDraft').textContent = state.drafts.filter(d => !state.published.some(p => p.name === d.name)).length;
  $('listSub').textContent = `${state.published.length} dipublikasikan · ${state.drafts.length} draft lokal`;
  const filtered = records.filter(x => (x.name + ' ' + x.target + ' ' + x.description).toLowerCase().includes(query));
  if (!filtered.length) { $('domainList').innerHTML = '<div class="empty">Belum ada nama yang cocok. Buat nama pertama di formulir atas.</div>'; return; }
  $('domainList').innerHTML = filtered.map(x => `<article class="domain-card"><div class="domain-info"><h4>${escapeHtml(x.name)}.tex <span class="tag">${x.published ? 'PUBLIK' : 'DRAFT LOKAL'}</span></h4><p>${escapeHtml(x.description || 'Tanpa catatan')}</p><p>Tujuan: ${escapeHtml(x.target)}</p>${x.published ? `<a href="${escapeHtml(redirectUrl(x.name))}" target="_blank" rel="noopener">${escapeHtml(redirectUrl(x.name))}</a>` : '<p>Ekspor dan publikasikan untuk membagikan link.</p>'}</div><div class="card-actions"><button class="small-btn" data-action="copy" data-name="${escapeHtml(x.name)}">Salin link</button><button class="small-btn" data-action="edit" data-name="${escapeHtml(x.name)}">Edit</button><button class="small-btn danger" data-action="delete" data-name="${escapeHtml(x.name)}">Hapus</button></div></article>`).join('');
}
function clearForm() { $('domainForm').reset(); $('editId').value = ''; $('saveBtn').textContent = 'Simpan nama'; $('cancelEdit').classList.add('hidden'); state.editId = null; $('formMessage').textContent = ''; }
$('domainForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('domainName').value.trim().toLowerCase(); const target = $('targetUrl').value.trim(); const description = $('description').value.trim();
  if (!validName.test(name)) { $('formMessage').textContent = 'Nama tidak valid. Gunakan huruf kecil, angka, atau tanda hubung di tengah.'; return; }
  if (!safeUrl(target)) { $('formMessage').textContent = 'URL tujuan harus HTTPS yang valid.'; return; }
  if (state.published.some(x => x.name === name) && state.editId !== name) { $('formMessage').textContent = 'Nama ini sudah ada di daftar publik.'; return; }
  const record = {id:name,name,target:new URL(target).href,description};
  state.drafts = state.drafts.filter(x => x.name !== (state.editId || name));
  state.drafts.push(record); saveDrafts(); clearForm(); render(); showToast('Draft disimpan di browser ini.');
});
$('cancelEdit').addEventListener('click', clearForm);
$('searchInput').addEventListener('input', render);
$('domainList').addEventListener('click', async e => {
  const b = e.target.closest('button[data-action]'); if (!b) return;
  const name = b.dataset.name; const record = allRecords().find(x => x.name === name); if (!record) return;
  if (b.dataset.action === 'copy') {
    const link = record.published ? redirectUrl(name) : record.target;
    try { await navigator.clipboard.writeText(link); showToast(record.published ? 'Link pengalihan disalin.' : 'Draft belum publik; URL tujuan disalin.'); }
    catch { window.prompt('Salin link ini:', link); }
  } else if (b.dataset.action === 'edit') {
    $('domainName').value = record.name; $('targetUrl').value = record.target; $('description').value = record.description;
    state.editId = record.name; $('editId').value = record.name; $('saveBtn').textContent = 'Simpan perubahan'; $('cancelEdit').classList.remove('hidden'); $('manage').scrollIntoView({behavior:'smooth'});
  } else if (b.dataset.action === 'delete') {
    if (!confirm(`Hapus ${name}.tex dari daftar lokal/draft? Untuk menghapus versi publik, edit domains.json di repository juga.`)) return;
    state.drafts = state.drafts.filter(x => x.name !== name); saveDrafts(); render(); showToast('Draft lokal dihapus.');
  }
});
$('exportBtn').addEventListener('click', () => {
  const domains = allRecords().map(({id,name,target,description}) => ({id,name,target,description}));
  const blob = new Blob([JSON.stringify({version:1,domains},null,2)+'\n'], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'domains.json'; a.click(); URL.revokeObjectURL(a.href); showToast('File domains.json diekspor.');
});
$('importFile').addEventListener('change', async e => {
  const file = e.target.files?.[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text()); if (!Array.isArray(data.domains)) throw new Error('Format harus memiliki array domains.');
    const rows = data.domains.map(normalizeRecord); if (rows.some(x => !x)) throw new Error('Ada record tidak valid. Pastikan semua nama benar dan URL menggunakan HTTPS.');
    const seen = new Set(); for (const row of rows) { if (seen.has(row.name)) throw new Error('Nama duplikat: '+row.name); seen.add(row.name); }
    state.drafts = rows.filter(row => !state.published.some(p => p.name === row.name)); saveDrafts(); render(); showToast('JSON diimpor ke draft lokal.');
  } catch (err) { alert('Gagal mengimpor: '+err.message); }
  e.target.value = '';
});
async function init() {
  const params = new URLSearchParams(location.search); const go = params.get('go');
  await loadPublished(); state.drafts = readDrafts();
  if (go) {
    const name = go.trim().toLowerCase(); const record = state.published.find(x => x.name === name);
    if (record) { document.body.innerHTML = `<main style="max-width:650px;margin:12vh auto;padding:24px;font-family:system-ui;color:#f3f5ff;background:#090b14"><h1>Menuju ${escapeHtml(record.name)}.tex…</h1><p>Tujuan: ${escapeHtml(record.target)}</p><p>Jika tidak berpindah otomatis, <a style="color:#6ee7f9" href="${escapeHtml(record.target)}" rel="noopener">buka website tujuan</a>.</p></main>`; setTimeout(() => { location.replace(record.target); }, 900); return; }
    document.querySelector('.hero').innerHTML = `<div class="eyebrow">NAMA TIDAK DITEMUKAN</div><h1>Belum ada <span>${escapeHtml(name)}.tex</span></h1><p>Nama ini belum ada dalam daftar publik. Pastikan pengelola telah mempublikasikan file domains.json.</p><a class="btn primary" href="${location.pathname}">Kembali ke Maxiel Domain Control</a>`;
  }
  render();
}
init();
