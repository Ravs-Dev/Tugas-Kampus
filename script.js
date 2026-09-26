let formulaInputTimer = null;
let cachedSimulatorData = null;
let cachedArgumentData = null;

function switchMainTab(tabKey) {
  const tabs = ['simulator', 'argumen', 'panduan', 'kelompok'];

  tabs.forEach(t => {
    const panel = document.getElementById(`panel-${t}`);
    const btn = document.getElementById(`nav-btn-${t}`);

    if (t === tabKey) {
      if (panel) panel.classList.remove('hidden');

      if (btn) {
        btn.className =
          'tab-btn active-tab flex items-center gap-space-xs px-space-md py-2.5 rounded-lg font-headline-sm text-headline-sm transition-all duration-200 bg-surface-elevated text-primary shadow-[0_0_16px_rgba(99,102,241,0.25)]';
      }
    } else {
      if (panel) panel.classList.add('hidden');

      if (btn) {
        btn.className =
          'tab-btn flex items-center gap-space-xs px-space-md py-2.5 rounded-lg font-headline-sm text-headline-sm text-text-secondary hover:text-on-surface hover:bg-surface-elevated/50 transition-all duration-200';
      }
    }
  });

  const headerNavLinks = document.querySelectorAll('header nav a');

  headerNavLinks.forEach(link => {
    const path = link.getAttribute('data-path');

    if (
      (tabKey === 'simulator' && path === 'simulator-proposisi') ||
      (tabKey === 'argumen' && path === 'verifikator-argumen') ||
      (tabKey === 'panduan' && path === 'panduan-inferensi') ||
      (tabKey === 'kelompok' && path === 'anggota-kelompok')
    ) {
      link.className =
        'px-space-md py-space-sm rounded-lg font-body-md text-body-md bg-surface-elevated text-primary font-semibold shadow-[0_0_12px_rgba(99,102,241,0.25)]';
    } else {
      link.className =
        'px-space-md py-space-sm rounded-lg font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all';
    }
  });

  if (tabKey === 'simulator' && !cachedSimulatorData) {
    evaluateSimulatorFormula();
  } else if (tabKey === 'argumen' && !cachedArgumentData) {
    verifyCurrentArgument();
  }
}

function setupHeaderNavSync() {
  const navMapping = {
    'simulator-proposisi': 'simulator',
    'verifikator-argumen': 'argumen',
    'panduan-inferensi': 'panduan',
    'anggota-kelompok': 'kelompok'
  };

  document.querySelectorAll('header nav a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();

      const p = a.getAttribute('data-path');

      if (navMapping[p]) {
        switchMainTab(navMapping[p]);
      }
    });
  });
}

function normalizeExpression(expr) {
  if (!expr) return '';

  return expr
    .replace(/<->/g, '↔')
    .replace(/<-->/g, '↔')
    .replace(/iff/gi, '↔')
    .replace(/->/g, '→')
    .replace(/-->/g, '→')
    .replace(/implies/gi, '→')
    .replace(/&&/g, '∧')
    .replace(/&/g, '∧')
    .replace(/and/gi, '∧')
    .replace(/\|\|/g, '∨')
    .replace(/\|/g, '∨')
    .replace(/or/gi, '∨')
    .replace(/~/g, '¬')
    .replace(/!/g, '¬')
    .replace(/not/gi, '¬')
    .replace(/\^/g, '⊕')
    .replace(/xor/gi, '⊕')
    .replace(/\s+/g, '');
}

function tokenize(str) {
  const tokens = [];
  let i = 0;

  while (i < str.length) {
    const char = str[i];

    if (['(', ')', '¬', '∧', '∨', '→', '↔', '⊕'].includes(char)) {
      tokens.push(char);
      i++;
    } else if (/[a-zA-Z]/.test(char)) {
      tokens.push(char.toLowerCase());
      i++;
    } else if (/\s/.test(char)) {
      i++;
    } else {
      tokens.push(char);
      i++;
    }
  }

  return tokens;
}
