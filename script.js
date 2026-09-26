// ==========================================
// TAB SWITCHING
// ==========================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`panel-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ==========================================
// SIMULATOR PROPOSISI
// ==========================================
function insertSymbol(symbol) {
    const input = document.getElementById('formula-input');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = input.value.substring(0, start) + symbol + input.value.substring(end);
    input.focus();
    input.setSelectionRange(start + symbol.length, start + symbol.length);
}

function clearFormulaInput() {
    document.getElementById('formula-input').value = '';
    document.getElementById('result-simulator').innerHTML = '';
    document.getElementById('metrics-container').style.display = 'none';
}

function normalizeExpression(expr) {
    return expr
        .replace(/<->/g, '↔').replace(/<-->/g, '↔').replace(/iff/gi, '↔')
        .replace(/->/g, '→').replace(/-->/g, '→').replace(/implies/gi, '→')
        .replace(/&&/g, '∧').replace(/&/g, '∧').replace(/and/gi, '∧')
        .replace(/\|\|/g, '∨').replace(/\|/g, '∨').replace(/or/gi, '∨')
        .replace(/~/g, '¬').replace(/!/g, '¬').replace(/not/gi, '¬')
        .replace(/\^/g, '⊕').replace(/xor/gi, '⊕').replace(/\s+/g, '');
}

function tokenize(str) {
    const tokens = [];
    let i = 0;
    while (i < str.length) {
        const char = str[i];
        if (['(', ')', '¬', '∧', '∨', '→', '↔', '⊕'].includes(char)) {
            tokens.push(char); i++;
        } else if (/[a-zA-Z]/.test(char)) {
            tokens.push(char.toLowerCase()); i++;
        } else if (/\s/.test(char)) {
            i++;
        } else {
            tokens.push(char); i++;
        }
    }
    return tokens;
}

function parseExpressionToAST(tokens) {
    let current = 0;
    function parseBiconditional() {
        let left = parseImplication();
        while (current < tokens.length && tokens[current] === '↔') {
            current++;
            let right = parseImplication();
            left = { type: 'Binary', op: '↔', left, right };
        }
        return left;
    }
    function parseImplication() {
        let left = parseXor();
        if (current < tokens.length && tokens[current] === '→') {
            current++;
            let right = parseImplication();
            left = { type: 'Binary', op: '→', left, right };
        }
        return left;
    }
    function parseXor() {
        let left = parseDisjunction();
        while (current < tokens.length && tokens[current] === '⊕') {
            current++;
            let right = parseDisjunction();
            left = { type: 'Binary', op: '⊕', left, right };
        }
        return left;
    }
    function parseDisjunction() {
        let left = parseConjunction();
        while (current < tokens.length && tokens[current] === '∨') {
            current++;
            let right = parseConjunction();
            left = { type: 'Binary', op: '∨', left, right };
        }
        return left;
    }
    function parseConjunction() {
        let left = parseUnary();
        while (current < tokens.length && tokens[current] === '∧') {
            current++;
            let right = parseUnary();
            left = { type: 'Binary', op: '∧', left, right };
        }
        return left;
    }
    function parseUnary() {
        if (current < tokens.length && tokens[current] === '¬') {
            current++;
            let argument = parseUnary();
            return { type: 'Unary', op: '¬', argument };
        }
        return parsePrimary();
    }
    function parsePrimary() {
        const token = tokens[current];
        if (token === '(') {
            current++;
            const expr = parseBiconditional();
            if (tokens[current] === ')') current++;
            return expr;
        }
        if (/^[a-z]$/.test(token)) {
            current++;
            return { type: 'Variable', name: token };
        }
        throw new Error(`Karakter tidak terduga: '${token}'`);
    }
    return parseBiconditional();
}

function evaluateAST(ast, variableEnv) {
    if (!ast) return false;
    switch (ast.type) {
        case 'Variable': return Boolean(variableEnv[ast.name]);
        case 'Unary': return !evaluateAST(ast.argument, variableEnv);
        case 'Binary': {
            const leftVal = evaluateAST(ast.left, variableEnv);
            const rightVal = evaluateAST(ast.right, variableEnv);
            switch (ast.op) {
                case '∧': return leftVal && rightVal;
                case '∨': return leftVal || rightVal;
                case '⊕': return (!leftVal && rightVal) || (leftVal && !rightVal);
                case '→': return (!leftVal) || rightVal;
                case '↔': return leftVal === rightVal;
                default: return false;
            }
        }
        default: return false;
    }
}

function extractVariables(expr) {
    const rawMatches = expr.match(/[a-zA-Z]/g) || [];
    const set = new Set(rawMatches.map(m => m.toLowerCase()).filter(v => v !== 't' && v !== 'f' || rawMatches.length === 1));
    return Array.from(set).sort();
}

function evaluateSimulatorFormula() {
    const rawInput = document.getElementById('formula-input').value.trim();
    if (!rawInput) return;

    const norm = normalizeExpression(rawInput);
    const vars = extractVariables(rawInput);
    if (vars.length === 0) vars.push('p');
    if (vars.length > 5) {
        alert('Maksimal 5 variabel (p, q, r, s, t)!');
        return;
    }

    let ast;
    try {
        ast = parseExpressionToAST(tokenize(norm));
    } catch (err) {
        document.getElementById('result-simulator').innerHTML = '<p style="color: var(--danger); text-align: center;">⚠️ Sintaks tidak valid!</p>';
        return;
    }

    const n = vars.length;
    const totalRows = Math.pow(2, n);
    const tableRows = [];
    let trueCount = 0;

    for (let r = 0; r < totalRows; r++) {
        const env = {};
        for (let j = 0; j < n; j++) {
            env[vars[j]] = ((r >> (n - 1 - j)) & 1) === 0;
        }
        const res = evaluateAST(ast, env);
        if (res) trueCount++;
        tableRows.push({ env, result: res });
    }

    // Update Metrics
    document.getElementById('metrics-container').style.display = 'grid';
    let classification = 'Kontingensi';
    let classColor = 'var(--warning)';
    if (trueCount === totalRows) { classification = 'Tautologi'; classColor = 'var(--success)'; }
    else if (trueCount === 0) { classification = 'Kontradiksi'; classColor = 'var(--danger)'; }

    document.getElementById('metric-class').textContent = classification;
    document.getElementById('metric-class').style.color = classColor;
    document.getElementById('metric-ratio').textContent = `${trueCount} / ${totalRows} (${((trueCount/totalRows)*100).toFixed(1)}%)`;
    document.getElementById('metric-vars').textContent = vars.join(', ');
    document.getElementById('metric-rows').textContent = totalRows;

    // Render Table
    let html = '<table><thead><tr><th>#</th>';
    vars.forEach(v => html += `<th>${v}</th>`);
    html += `<th>${rawInput}</th></tr></thead><tbody>`;

    tableRows.forEach((row, idx) => {
        html += `<tr><td>${idx + 1}</td>`;
        vars.forEach(v => {
            html += `<td class="${row.env[v] ? 'val-t' : 'val-f'}">${row.env[v] ? 'T' : 'F'}</td>`;
        });
        html += `<td class="${row.result ? 'val-t' : 'val-f'}">${row.result ? 'T' : 'F'}</td></tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('result-simulator').innerHTML = html;
}

// ==========================================
// VERIFIKATOR ARGUMEN
// ==========================================
function addPremise() {
    const container = document.getElementById('premises-container');
    const count = container.querySelectorAll('.premise-row').length + 1;
    if (count > 6) { alert('Maksimal 6 premis!'); return; }
    
    const row = document.createElement('div');
    row.className = 'premise-row';
    row.innerHTML = `
        <span class="premise-badge">P${count}</span>
        <input type="text" class="premise-input" placeholder="Premis ${count}">
        <button class="btn-icon" onclick="removePremise(this)">✕</button>
    `;
    container.appendChild(row);
}

function removePremise(btn) {
    const container = document.getElementById('premises-container');
    if (container.querySelectorAll('.premise-row').length <= 1) {
        alert('Minimal 1 premis diperlukan!');
        return;
    }
    btn.closest('.premise-row').remove();
    // Reindex badges
    container.querySelectorAll('.premise-row').forEach((row, idx) => {
        row.querySelector('.premise-badge').textContent = `P${idx + 1}`;
    });
}

function verifyCurrentArgument() {
    const premiseInputs = Array.from(document.querySelectorAll('.premise-input'));
    const rawPremises = premiseInputs.map(i => i.value.trim()).filter(v => v.length > 0);
    const rawConcl = document.getElementById('conclusion-input').value.trim();

    if (rawPremises.length === 0 || !rawConcl) {
        alert('Masukkan minimal 1 premis dan konklusi!');
        return;
    }

    const allExprs = [...rawPremises, rawConcl];
    const varSet = new Set();
    allExprs.forEach(e => extractVariables(e).forEach(v => varSet.add(v)));
    const vars = Array.from(varSet).sort();
    if (vars.length === 0) vars.push('p');

    let premiseAsts, conclAst;
    try {
        premiseAsts = rawPremises.map(p => parseExpressionToAST(tokenize(normalizeExpression(p))));
        conclAst = parseExpressionToAST(tokenize(normalizeExpression(rawConcl)));
    } catch (err) {
        document.getElementById('result-argumen').innerHTML = '<p style="color: var(--danger); text-align: center;">⚠️ Sintaks tidak valid!</p>';
        return;
    }

    const n = vars.length;
    const totalRows = Math.pow(2, n);
    let isValid = true;
    let counterexamples = [];

    for (let r = 0; r < totalRows; r++) {
        const env = {};
        for (let j = 0; j < n; j++) {
            env[vars[j]] = ((r >> (n - 1 - j)) & 1) === 0;
        }

        const pValues = premiseAsts.map(ast => evaluateAST(ast, env));
        const allPremisesTrue = pValues.every(v => v === true);
        const conclVal = evaluateAST(conclAst, env);

        if (allPremisesTrue && !conclVal) {
            isValid = false;
            counterexamples.push(r + 1);
        }
    }

    // Render Result
    let resultHtml = '';
    if (isValid) {
        resultHtml = `
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <h3 style="color: var(--success); margin-bottom: 8px;">✅ ARGUMEN VALID (SAH)</h3>
                <p style="color: var(--text-secondary); font-size: 14px;">Tidak ditemukan counterexample. Jika semua premis benar, konklusi pasti benar.</p>
            </div>
        `;
    } else {
        resultHtml = `
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <h3 style="color: var(--danger); margin-bottom: 8px;">❌ ARGUMEN TIDAK VALID (FALASI)</h3>
                <p style="color: var(--text-secondary); font-size: 14px;">Ditemukan counterexample pada baris: <strong>${counterexamples.join(', ')}</strong></p>
            </div>
        `;
    }

    // Render Table
    resultHtml += '<table><thead><tr><th>#</th>';
    vars.forEach(v => resultHtml += `<th>${v}</th>`);
    rawPremises.forEach((_, i) => resultHtml += `<th>P${i+1}</th>`);
    resultHtml += `<th>Konklusi</th><th>Status</th></tr></thead><tbody>`;

    for (let r = 0; r < totalRows; r++) {
        const env = {};
        for (let j = 0; j < n; j++) env[vars[j]] = ((r >> (n - 1 - j)) & 1) === 0;
        
        const pValues = premiseAsts.map(ast => evaluateAST(ast, env));
        const allPremisesTrue = pValues.every(v => v === true);
        const conclVal = evaluateAST(conclAst, env);
        const isCounter = allPremisesTrue && !conclVal;

        resultHtml += `<tr style="${isCounter ? 'background: rgba(239, 68, 68, 0.15);' : ''}">`;
        resultHtml += `<td>${r + 1}</td>`;
        vars.forEach(v => resultHtml += `<td class="${env[v] ? 'val-t' : 'val-f'}">${env[v] ? 'T' : 'F'}</td>`);
        pValues.forEach(v => resultHtml += `<td class="${v ? 'val-t' : 'val-f'}">${v ? 'T' : 'F'}</td>`);
        resultHtml += `<td class="${conclVal ? 'val-t' : 'val-f'}">${conclVal ? 'T' : 'F'}</td>`;
        resultHtml += `<td>${isCounter ? '<span style="color: var(--danger); font-weight: 600;">Counter</span>' : (allPremisesTrue ? '<span style="color: var(--success);">Kritis</span>' : '-')}</td>`;
        resultHtml += '</tr>';
    }
    resultHtml += '</tbody></table>';
    document.getElementById('result-argumen').innerHTML = resultHtml;
}
