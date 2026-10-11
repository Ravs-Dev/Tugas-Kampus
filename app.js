const $ = (id) => document.getElementById(id);

const datasets = {
  one: {
    U: ['1','2','3','4','5','6','7','8','9','10'],
    A: ['1','2','3','4','5','6'],
    B: ['4','5','6','7','8']
  },
  two: {
    U: ['Andi','Budi','Citra','Dina','Eka','Fajar','Gita','Hana','Irfan','Joko'],
    A: ['Andi','Budi','Citra','Dina','Eka','Fajar'],
    B: ['Citra','Dina','Eka','Gita','Hana','Irfan']
  }
};

function parseSet(value) {
  return [...new Set(value.split(',').map(v => v.trim()).filter(Boolean))];
}

function keyMap(values) {
  const map = new Map();
  values.forEach(v => map.set(v.toLowerCase(), v));
  return map;
}

function union(a, b) {
  const map = keyMap(a);
  b.forEach(v => { if (!map.has(v.toLowerCase())) map.set(v.toLowerCase(), v); });
  return [...map.values()];
}

function intersection(a, b) {
  const bKeys = new Set(b.map(v => v.toLowerCase()));
  return a.filter(v => bKeys.has(v.toLowerCase()));
}

function difference(a, b) {
  const bKeys = new Set(b.map(v => v.toLowerCase()));
  return a.filter(v => !bKeys.has(v.toLowerCase()));
}

function formatSet(values) {
  return values.length ? `{ ${values.join(', ')} }` : '∅';
}

function isSubset(child, parent) {
  const parentKeys = new Set(parent.map(v => v.toLowerCase()));
  return child.every(v => parentKeys.has(v.toLowerCase()));
}

function render() {
  const U = parseSet($('universe').value);
  const A = parseSet($('setA').value);
  const B = parseSet($('setB').value);
  const msg = $('message');

  msg.className = 'message';
  if (!U.length || !A.length || !B.length) {
    msg.textContent = 'Isi himpunan U, A, dan B terlebih dahulu.';
    msg.classList.add('error');
    return;
  }
  if (!isSubset(A, U) || !isSubset(B, U)) {
    msg.textContent = 'Semua anggota A dan B harus terdapat di dalam himpunan semesta U.';
    msg.classList.add('error');
    return;
  }

  const inter = intersection(A, B);
  const uni = union(A, B);
  const aOnly = difference(A, B);
  const bOnly = difference(B, A);
  const compA = difference(U, A);
  const compB = difference(U, B);
  const outside = difference(U, uni);

  $('union').textContent = formatSet(uni);
  $('intersection').textContent = formatSet(inter);
  $('aMinusB').textContent = formatSet(aOnly);
  $('bMinusA').textContent = formatSet(bOnly);
  $('compA').textContent = formatSet(compA);
  $('compB').textContent = formatSet(compB);

  $('countA').textContent = A.length;
  $('countB').textContent = B.length;
  $('countIntersection').textContent = inter.length;
  $('countUnion').textContent = uni.length;
  $('formulaResult').textContent = `${A.length} + ${B.length} − ${inter.length} = ${uni.length}`;

  $('vennAOnly').textContent = aOnly.length;
  $('vennBoth').textContent = inter.length;
  $('vennBOnly').textContent = bOnly.length;
  $('vennOutside').textContent = `Di luar A dan B: ${outside.length}`;

  $('aOnlyMembers').textContent = formatSet(aOnly);
  $('bothMembers').textContent = formatSet(inter);
  $('bOnlyMembers').textContent = formatSet(bOnly);
  $('outsideMembers').textContent = formatSet(outside);

  msg.textContent = 'Perhitungan berhasil. Diagram Venn sudah diperbarui.';
  msg.classList.add('success');
}

function loadDataset(data) {
  $('universe').value = data.U.join(', ');
  $('setA').value = data.A.join(', ');
  $('setB').value = data.B.join(', ');
  render();
}

function resetAll() {
  $('universe').value = '';
  $('setA').value = '';
  $('setB').value = '';
  ['union','intersection','aMinusB','bMinusA','compA','compB'].forEach(id => $(id).textContent = '-');
  ['countA','countB','countIntersection','countUnion','vennAOnly','vennBoth','vennBOnly'].forEach(id => $(id).textContent = '0');
  $('formulaResult').textContent = '-';
  $('vennOutside').textContent = 'Di luar A dan B: 0';
  ['aOnlyMembers','bothMembers','bOnlyMembers','outsideMembers'].forEach(id => $(id).textContent = '-');
  $('message').textContent = '';
  $('message').className = 'message';
}

$('calculate').addEventListener('click', render);
$('dataset1').addEventListener('click', () => loadDataset(datasets.one));
$('dataset2').addEventListener('click', () => loadDataset(datasets.two));
$('reset').addEventListener('click', resetAll);

loadDataset(datasets.one);
