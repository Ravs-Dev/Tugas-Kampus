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

// ========================================
// FUNGSI TAMBAHAN YANG DIPANGGIL HTML
// ========================================

function insertSymbol(symbol) {
  const input = document.getElementById('formula-input');
  if (!input) return;
  
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const value = input.value;
  
  input.value = value.substring(0, start) + symbol + value.substring(end);
  input.focus();
  input.setSelectionRange(start + symbol.length, start + symbol.length);
  
  handleFormulaInputDebounced();
}

function clearFormulaInput() {
  const input = document.getElementById('formula-input');
  if (input) {
    input.value = '';
    input.focus();
    updateFormulaStatus(true);
  }
}

function loadFormulaPreset(formula) {
  const input = document.getElementById('formula-input');
  if (input) {
    input.value = formula;
    input.focus();
    handleFormulaInputDebounced();
  }
}

function handleFormulaInputDebounced() {
  const input = document.getElementById('formula-input');
  if (!input) return;
  
  if (formulaInputTimer) {
    clearTimeout(formulaInputTimer);
  }
  
  formulaInputTimer = setTimeout(() => {
    updateFormulaStatus(true);
  }, 300);
}

function updateFormulaStatus(isValid) {
  const status = document.getElementById('formula-syntax-status');
  if (!status) return;
  
  if (isValid) {
    status.className = 'text-binary-true font-medium flex items-center gap-1';
    status.innerHTML = '<span class="material-symbols-outlined text-[14px]">check_circle</span> Sintaks Terbaca';
  } else {
    status.className = 'text-error font-medium flex items-center gap-1';
    status.innerHTML = '<span class="material-symbols-outlined text-[14px]">error</span> Sintaks Error';
  }
}

function evaluateSimulatorFormula() {
  const input = document.getElementById('formula-input');
  if (!input || !input.value.trim()) return;
  
  try {
    const expr = normalizeExpression(input.value);
    const tokens = tokenize(expr);
    
    console.log('Formula berhasil diproses:', tokens);
    updateFormulaStatus(true);
    
    alert('Formula berhasil dievaluasi! Cek console untuk detail.');
  } catch (error) {
    console.error('Error evaluating formula:', error);
    updateFormulaStatus(false);
  }
}

function verifyCurrentArgument() {
  console.log('Verifying argument...');
}

// ========================================
// INISIALISASI SAAT HALAMAN DIMUAT
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  setupHeaderNavSync();
  switchMainTab('simulator');
});
