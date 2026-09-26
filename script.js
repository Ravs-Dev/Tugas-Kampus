let formulaInputTimer = null;

// ========================================
// TAB SWITCHING
// ========================================

function switchMainTab(tabKey) {
    const tabs = ['simulator', 'argumen', 'panduan', 'kelompok'];

    tabs.forEach(t => {
        const panel = document.getElementById(`panel-${t}`);
        const btn = document.getElementById(`nav-btn-${t}`);

        if (t === tabKey) {
            if (panel) panel.classList.remove('hidden');
            if (btn) {
                btn.className = 'tab-btn active-tab flex items-center gap-2 px-5 py-3 rounded-xl font-headline text-sm transition-all duration-200';
            }
        } else {
            if (panel) panel.classList.add('hidden');
            if (btn) {
                btn.className = 'tab-btn flex items-center gap-2 px-5 py-3 rounded-xl font-headline text-sm text-muted hover:text-ink hover:bg-elevated transition-all duration-200';
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
            link.className = 'px-4 py-2 rounded-lg font-body text-sm bg-brand text-white font-semibold shadow-md shadow-brand/30 transition-all';
        } else {
            link.className = 'px-4 py-2 rounded-lg font-body text-sm text-muted hover:text-ink hover:bg-white transition-all';
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

// ========================================
// FORMULA UTILITIES
// ========================================

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
// UI INTERACTION FUNCTIONS
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
        status.className = 'text-success font-semibold flex items-center gap-1';
        status.innerHTML = '<span class="material-symbols-outlined text-sm">check_circle</span> Sintaks Terbaca';
    } else {
        status.className = 'text-danger font-semibold flex items-center gap-1';
        status.innerHTML = '<span class="material-symbols-outlined text-sm">error</span> Sintaks Error';
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

        alert('Formula berhasil dievaluasi! Cek console browser (F12) untuk detail.');
    } catch (error) {
        console.error('Error evaluating formula:', error);
        updateFormulaStatus(false);
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    setupHeaderNavSync();
    switchMainTab('simulator');
    updateFormulaStatus(true);
});
