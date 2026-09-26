function insert(symbol) {
    const input = document.getElementById('expression');
    input.value += symbol;
}

function clearInput() {
    document.getElementById('expression').value = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('result').classList.remove('active');
}

function generateTable() {
    const expr = document.getElementById('expression').value;
    const resultDiv = document.getElementById('result');

    if (!expr) {
        resultDiv.innerHTML = '<p style="color: var(--danger); text-align: center; font-weight: 500;">⚠️ Masukkan ekspresi logika terlebih dahulu!</p>';
        resultDiv.classList.add('active');
        return;
    }

    const combinations = [
        { P: true, Q: true },
        { P: true, Q: false },
        { P: false, Q: true },
        { P: false, Q: false }
    ];

    let html = `
        <h3>📊 Truth Table Result</h3>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>P</th>
                    <th>Q</th>
                    <th>Result</th>
                </tr>
            </thead>
            <tbody>
    `;

    combinations.forEach((row, index) => {
        const res = evaluateExpression(expr, row.P, row.Q);
        const rowClass = res ? 'value-true' : 'value-false';
        html += `
            <tr>
                <td>${index + 1}</td>
                <td class="${row.P ? 'value-true' : 'value-false'}">${row.P ? 'T' : 'F'}</td>
                <td class="${row.Q ? 'value-true' : 'value-false'}">${row.Q ? 'T' : 'F'}</td>
                <td class="${rowClass}">${res ? 'True ✓' : 'False ✗'}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    resultDiv.innerHTML = html;
    resultDiv.classList.add('active');
}

function evaluateExpression(expr, P, Q) {
    let evalExpr = expr
        .replace(/P/g, P)
        .replace(/Q/g, Q)
        .replace(/¬true/g, 'false')
        .replace(/¬false/g, 'true')
        .replace(/∧/g, '&&')
        .replace(/∨/g, '||');

    while (evalExpr.includes('→')) {
        evalExpr = evalExpr.replace(/([a-z]+)\s*→\s*([a-z]+)/g, '(!$1 || $2)');
    }

    while (evalExpr.includes('')) {
        evalExpr = evalExpr.replace(/([a-z]+)\s*↔\s*([a-z]+)/g, '($1 === $2)');
    }

    try {
        return Function(`"use strict"; return (${evalExpr})`)();
    } catch (e) {
        return false;
    }
}
