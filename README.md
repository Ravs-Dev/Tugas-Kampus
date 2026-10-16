# Tugas-Kampus

procedure SelectionSort(input/output ( Mengurutkan S1, S2 } Masukan: S1, S2, Keluaran: S1 S2 s: array [1..n] of integer) Sn sehingga tersusun menaik dengan metode pengurutan seleksi. Sn s (terurut menaik)

Deklarasi

i, j, imin, temp integer

Algoritma:

for i 1 to n-1 do { jumlah pass sebanyak n 1) { cari elemen terkecil di dalam s[i], s[i+1, s[n]} imini ( elemen ke-i diasumsikan sebagai elemen terkecil sementara } for j i+1 to n do if s[j] < s[imin] then (pertukarkan s[imin] dengan s[i]) s[i]s[imin] s[imin] temp

imin j

endif

endfor

temps[i]

endfor
