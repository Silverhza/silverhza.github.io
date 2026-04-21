(function () {
  const API_BASE = 'https://admin.hezian.top';
  const SECTION_LABELS = { papers: '论文总结', notes: '知识点卡片', topics: '专题' };

  function parseContext() {
    const path = window.location.pathname.replace(/\/+/g, '/');
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return { kind: 'home' };
    const [section, slug] = parts;
    if (!SECTION_LABELS[section]) return { kind: 'other' };
    if (!slug) return { kind: 'section', section };
    return { kind: 'doc', section, slug };
  }

  function css() {
    const style = document.createElement('style');
    style.textContent = `
      .hz-admin-topnav{display:flex;align-items:center;gap:.5rem;margin-left:auto;padding-left:1rem;white-space:nowrap}
      .hz-admin-topnav .hz-admin-btn{appearance:none;border:0;border-radius:.45rem;padding:.38rem .68rem;background:rgba(255,255,255,.14);color:inherit;font:inherit;font-size:.72rem;cursor:pointer;text-decoration:none;line-height:1.2}
      .hz-admin-topnav .hz-admin-btn:hover{background:rgba(255,255,255,.22)}
      .hz-admin-topnav .hz-admin-btn.danger{background:rgba(185,28,28,.88);color:#fff}
      .hz-admin-topnav .hz-admin-btn.primary{background:rgba(37,99,235,.92);color:#fff}
      .hz-admin-topnav .hz-admin-user{font-size:.72rem;opacity:.82;margin-left:.2rem}
      .hz-admin-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:10000}
      .hz-admin-modal{width:min(92vw,420px);background:#0f172a;color:#fff;border:1px solid #334155;border-radius:16px;padding:18px}
      .hz-admin-modal h3{margin:0 0 12px;font-size:18px}
      .hz-admin-modal label{display:block;font-size:13px;margin:10px 0 6px;color:#cbd5e1}
      .hz-admin-modal input,.hz-admin-modal select{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid #334155;background:#111827;color:#fff;font:inherit}
      .hz-admin-note{font-size:12px;opacity:.82;margin-top:8px;line-height:1.35}
      @media (max-width: 960px){
        .hz-admin-topnav{display:none}
      }
    `;
    document.head.appendChild(style);
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) {
      if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function slugify(title) {
    const ascii = String(title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (ascii) return ascii;
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `doc-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  async function api(path, options = {}) {
    const res = await fetch(API_BASE + path, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  function openCreateModal(ctx) {
    const bg = el('div', { class: 'hz-admin-modal-bg' });
    const titleInput = el('input', { placeholder: '比如：gem5复现' });
    const slugInput = el('input', { placeholder: '比如：gem5-reproduction' });
    const sectionSelect = el('select');
    ['papers', 'notes', 'topics'].forEach(s => {
      const opt = el('option', { value: s, text: SECTION_LABELS[s] + ` (${s})` });
      if (ctx.section === s) opt.selected = true;
      sectionSelect.appendChild(opt);
    });
    titleInput.addEventListener('input', () => {
      if (!slugInput.dataset.touched) slugInput.value = slugify(titleInput.value);
    });
    slugInput.addEventListener('input', () => { slugInput.dataset.touched = '1'; });
    const submitBtn = el('button', { class: 'hz-admin-btn primary', text: '创建' });
    const cancelBtn = el('button', { class: 'hz-admin-btn', text: '取消' });
    const msg = el('div', { class: 'hz-admin-note' });
    cancelBtn.addEventListener('click', () => bg.remove());
    submitBtn.addEventListener('click', async () => {
      const payload = {
        section: sectionSelect.value,
        title: titleInput.value.trim(),
        slug: slugInput.value.trim() || slugify(titleInput.value.trim())
      };
      if (!payload.title) { msg.textContent = '请先填写标题。'; return; }
      try {
        submitBtn.disabled = true;
        const data = await api('/api/docs/create', { method: 'POST', body: JSON.stringify(payload) });
        msg.textContent = '创建成功，正在跳转…';
        setTimeout(() => { window.location.href = data.url || `/${payload.section}/${payload.slug}/`; }, 700);
      } catch (e) {
        submitBtn.disabled = false;
        msg.textContent = '创建失败：' + e.message;
      }
    });
    const modal = el('div', { class: 'hz-admin-modal' }, [
      el('h3', { text: '新建文档' }),
      el('label', { text: '栏目' }), sectionSelect,
      el('label', { text: '标题' }), titleInput,
      el('label', { text: 'slug（目录名）' }), slugInput,
      el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-top:12px' }, [submitBtn, cancelBtn]),
      msg
    ]);
    bg.appendChild(modal);
    bg.addEventListener('click', (e) => { if (e.target === bg) bg.remove(); });
    document.body.appendChild(bg);
  }

  async function deleteCurrent(ctx, btn, infoNode) {
    if (!confirm(`确认删除当前文档？\n\n栏目：${ctx.section}\nslug：${ctx.slug}\n\n说明：会直接从仓库中删除，但仍可从 Git 历史恢复。`)) return;
    try {
      btn.disabled = true;
      if (infoNode) infoNode.textContent = '删除中…';
      const data = await api('/api/docs/delete', {
        method: 'POST',
        body: JSON.stringify({ section: ctx.section, slug: ctx.slug })
      });
      if (infoNode) infoNode.textContent = '删除成功，正在跳转…';
      const target = data.url || `/${ctx.section}/`;
      window.location.replace(target);
    } catch (e) {
      btn.disabled = false;
      if (infoNode) infoNode.textContent = '删除失败';
      alert('删除失败：' + e.message);
    }
  }

  function findHost() {
    return document.querySelector('.md-tabs__list');
  }

  function buildTopNav(ctx, session) {
    const wrap = el('div', { class: 'hz-admin-topnav', 'data-hz-admin': '1' });
    const createBtn = el('button', { class: 'hz-admin-btn primary', text: '新建', type: 'button' });
    createBtn.addEventListener('click', () => openCreateModal(ctx));
    wrap.appendChild(createBtn);

    const adminBtn = el('a', { class: 'hz-admin-btn', href: API_BASE + '/', text: '后台' });
    wrap.appendChild(adminBtn);

    if (ctx.kind === 'doc') {
      const info = el('span', { class: 'hz-admin-user' });
      const delBtn = el('button', { class: 'hz-admin-btn danger', text: '删除', type: 'button' });
      delBtn.addEventListener('click', () => deleteCurrent(ctx, delBtn, info));
      wrap.appendChild(delBtn);
      wrap.appendChild(info);
    } else {
      wrap.appendChild(el('span', { class: 'hz-admin-user', text: session.user.username }));
    }

    return wrap;
  }

  function mountTopNav(node) {
    const host = findHost();
    if (!host) return false;
    const existing = host.querySelector('[data-hz-admin="1"]');
    if (existing) existing.remove();
    host.style.display = 'flex';
    host.style.alignItems = 'center';
    host.appendChild(node);
    return true;
  }

  async function init() {
    css();
    let session;
    try {
      session = await api('/api/session');
    } catch (e) {
      return;
    }
    if (!session.user || !session.user.is_admin) return;

    const ctx = parseContext();
    if (ctx.kind !== 'section' && ctx.kind !== 'doc') return;

    const nav = buildTopNav(ctx, session);
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (mountTopNav(nav) || tries > 10) clearInterval(timer);
    }, 300);
    mountTopNav(nav);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
