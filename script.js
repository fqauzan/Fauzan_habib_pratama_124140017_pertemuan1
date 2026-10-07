// Mengambil data keranjang dari localStorage
let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];

let promoAktif = false;


// Mengambil elemen HTML
const formBarang = document.getElementById("formBarang");

const namaBarang = document.getElementById("namaBarang");
const hargaBarang = document.getElementById("hargaBarang");
const qtyBarang = document.getElementById("qtyBarang");

const errorNama = document.getElementById("errorNama");
const errorHarga = document.getElementById("errorHarga");
const errorQty = document.getElementById("errorQty");

const tabelKeranjang = document.getElementById("tabelKeranjang");

const totalBelanja = document.getElementById("totalBelanja");
const nominalDiskon = document.getElementById("nominalDiskon");
const totalAkhir = document.getElementById("totalAkhir");

const kodePromo = document.getElementById("kodePromo");
const btnPromo = document.getElementById("btnPromo");
const pesanPromo = document.getElementById("pesanPromo");

const uangBayar = document.getElementById("uangBayar");
const pesanPembayaran = document.getElementById("pesanPembayaran");
const kembalian = document.getElementById("kembalian");

const btnTransaksi = document.getElementById("btnTransaksi");


// Fungsi format Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}


// Menyimpan keranjang ke localStorage
function simpanKeranjang() {
    localStorage.setItem(
        "keranjang",
        JSON.stringify(keranjang)
    );
}


// Menampilkan isi keranjang
function tampilkanKeranjang() {

    tabelKeranjang.innerHTML = "";

    keranjang.forEach(function(item, index) {

        const baris = document.createElement("tr");

        baris.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.nama}</td>
            <td>${formatRupiah(item.harga)}</td>
            <td>${item.qty}</td>
            <td>${formatRupiah(item.subtotal)}</td>
            <td>
                <button
                    class="btn-hapus"
                    onclick="hapusBarang(${index})"
                >
                    Hapus
                </button>
            </td>
        `;

        tabelKeranjang.appendChild(baris);
    });

    hitungTotal();
}


// Menambahkan barang
formBarang.addEventListener("submit", function(event) {

    event.preventDefault();

    // Menghapus pesan error sebelumnya
    errorNama.textContent = "";
    errorHarga.textContent = "";
    errorQty.textContent = "";

    let valid = true;

    const nama = namaBarang.value.trim();
    const harga = Number(hargaBarang.value);
    const qty = Number(qtyBarang.value);


    // Validasi nama
    if (nama.length < 3) {
        errorNama.textContent =
            "Nama barang wajib diisi minimal 3 karakter.";
        valid = false;
    }


    // Validasi harga
    if (harga < 500 || !Number.isFinite(harga)) {
        errorHarga.textContent =
            "Harga harus berupa angka minimal Rp500.";
        valid = false;
    }


    // Validasi quantity
    if (qty < 1 || !Number.isInteger(qty)) {
        errorQty.textContent =
            "Jumlah harus berupa angka bulat minimal 1.";
        valid = false;
    }


    // Jika data tidak valid
    if (!valid) {
        return;
    }


    // Menghitung subtotal
    const subtotal = harga * qty;


    // Memasukkan barang ke keranjang
    keranjang.push({
        nama: nama,
        harga: harga,
        qty: qty,
        subtotal: subtotal
    });


    // Simpan ke localStorage
    simpanKeranjang();


    // Tampilkan keranjang
    tampilkanKeranjang();


    // Reset form
    formBarang.reset();
});


// Fungsi menghapus barang
function hapusBarang(index) {

    keranjang.splice(index, 1);

    simpanKeranjang();

    tampilkanKeranjang();
}


// Menghitung total belanja
function hitungTotal() {

    let total = 0;

    keranjang.forEach(function(item) {
        total += item.subtotal;
    });


    // Diskon
    let diskon = 0;

    if (total >= 50000 || promoAktif) {
        diskon = total * 0.10;
    }


    const akhir = total - diskon;


    totalBelanja.textContent = formatRupiah(total);
    nominalDiskon.textContent = formatRupiah(diskon);
    totalAkhir.textContent = formatRupiah(akhir);


    hitungKembalian();
}


// Tombol promo
btnPromo.addEventListener("click", function() {

    const kode = kodePromo.value.trim().toUpperCase();

    if (kode === "HEMAT10") {

        promoAktif = true;

        pesanPromo.textContent =
            "Kode promo berhasil digunakan. Diskon 10%.";

        pesanPromo.style.color = "green";

    } else {

        promoAktif = false;

        pesanPromo.textContent =
            "Kode promo tidak valid.";

        pesanPromo.style.color = "red";
    }

    hitungTotal();
});


// Menghitung kembalian
uangBayar.addEventListener("input", function() {

    hitungKembalian();

});


function hitungKembalian() {

    let total = 0;

    keranjang.forEach(function(item) {
        total += item.subtotal;
    });


    let diskon = 0;

    if (total >= 50000 || promoAktif) {
        diskon = total * 0.10;
    }


    const totalYangHarusDibayar = total - diskon;

    const bayar = Number(uangBayar.value);


    if (totalYangHarusDibayar === 0) {

        kembalian.textContent = formatRupiah(0);

        pesanPembayaran.textContent = "";

        return;
    }


    if (bayar < totalYangHarusDibayar) {

        kembalian.textContent = formatRupiah(0);

        pesanPembayaran.textContent =
            "Uang belum mencukupi.";

        pesanPembayaran.style.color = "red";

    } else {

        const hasil = bayar - totalYangHarusDibayar;

        kembalian.textContent = formatRupiah(hasil);

        pesanPembayaran.textContent =
            "Pembayaran cukup.";

        pesanPembayaran.style.color = "green";
    }
}


// Tombol transaksi baru
btnTransaksi.addEventListener("click", function() {

    const konfirmasi = confirm(
        "Apakah kamu yakin ingin menghapus transaksi?"
    );

    if (!konfirmasi) {
        return;
    }


    keranjang = [];

    promoAktif = false;

    localStorage.removeItem("keranjang");

    formBarang.reset();

    kodePromo.value = "";
    uangBayar.value = "";

    pesanPromo.textContent = "";
    pesanPembayaran.textContent = "";

    tampilkanKeranjang();
});


// Menampilkan data ketika halaman pertama dibuka
tampilkanKeranjang();