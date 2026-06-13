let satirNo = 0;
let sonKalemler = [];
let sonToplam = 0;
let sonAdet = 0;

function bugun() {
  const d = new Date();
  return String(d.getDate()).padStart(2, "0") + "." +
    String(d.getMonth() + 1).padStart(2, "0") + "." +
    d.getFullYear();
}

function teklifNoUret() {
  const y = new Date().getFullYear();
  const key = "olkun_teklif_sayac_" + y;
  let no = localStorage.getItem(key);
  no = !no ? 1 : parseInt(no, 10) + 1;
  localStorage.setItem(key, no);
  return "OT-" + y + "-" + String(no).padStart(3, "0");
}

function tl(n) {
  return Math.round(n).toLocaleString("tr-TR") + " TL";
}

function sayi(v) {
  return parseFloat(String(v || "").replace(",", ".")) || 0;
}

function satirEkle() {
  satirNo++;
  const div = document.createElement("div");
  div.className = "line";

  div.innerHTML = `
    <input class="en" type="number" placeholder="En">
    <input class="boy" type="number" placeholder="Boy">
    <input class="renk" name="renk_${satirNo}" type="radio" value="renkli">
    <input class="renk" name="renk_${satirNo}" type="radio" value="beyaz" checked>
    <input class="adet" type="number" value="1" min="1">
    <input class="duble" type="checkbox">
    <div class="price">0 TL</div>
  `;

  document.getElementById("rows").appendChild(div);

  div.querySelectorAll("input").forEach((el) => {
    el.addEventListener("input", hesapla);
    el.addEventListener("change", hesapla);
  });
}

function hesapla() {
  const rows = document.querySelectorAll(".line");
  let toplam = 0;
  let adetToplam = 0;
  const kalemler = [];
  const mod = document.getElementById("mod").value;
  const fiyatGizli = document.getElementById("fiyatGorunum").value === "gizli";

  rows.forEach((row) => {
    const en = sayi(row.querySelector(".en").value);
    const boy = sayi(row.querySelector(".boy").value);
    let adet = sayi(row.querySelector(".adet").value);
    if (adet <= 0) adet = 1;

    const renk = row.querySelector(".renk:checked").value;
    const duble = row.querySelector(".duble").checked;

    let fiyat = 0;

    if (en > 0 && boy > 0) {
      const cevre = ((en + boy) * 2) / 100;
      let bayi = 192 + (cevre * 211);

      if (renk === "renkli") bayi *= 1.15;
      if (duble) bayi *= 1.40;

      fiyat = mod === "son" ? bayi * 1.6 : bayi;
      fiyat = Math.round(fiyat * adet);

      toplam += fiyat;
      adetToplam += adet;

      kalemler.push({
        no: kalemler.length + 1,
        en,
        boy,
        adet,
        renk: renk === "renkli" ? "Renkli" : "Beyaz",
        tip: duble ? "Duble" : "Standart",
        fiyat
      });
    }

    row.querySelector(".price").innerText = fiyatGizli ? "-" : tl(fiyat);
  });

  sonKalemler = kalemler;
  sonToplam = Math.round(toplam);
  sonAdet = adetToplam;

  document.getElementById("toplamAdet").innerText = sonAdet;
  document.getElementById("toplamFiyat").innerText = tl(sonToplam);
}

function sifirla() {
  document.getElementById("rows").innerHTML = "";
  document.getElementById("musteri").value = "";
  document.getElementById("telefon").value = "";
  document.getElementById("teklifNo").value = teklifNoUret();

  sonKalemler = [];
  sonToplam = 0;
  sonAdet = 0;

  for (let i = 0; i < 10; i++) satirEkle();
  hesapla();
}

function whatsappGonder() {
  hesapla();

  if (sonKalemler.length === 0) {
    alert("Ölçü giriniz");
    return;
  }

  let mesaj = "📋 OLKUN SİNEKLİK TEKLİF\n\n";
  mesaj += "🧾 Teklif No: " + document.getElementById("teklifNo").value + "\n";
  mesaj += "📅 Tarih: " + document.getElementById("tarih").value + "\n";
  mesaj += "👤 Müşteri: " + (document.getElementById("musteri").value || "-") + "\n";
  mesaj += "📞 Telefon: " + (document.getElementById("telefon").value || "-") + "\n\n";
  mesaj += "━━━━━━━━━━━━━━\n\n";

  sonKalemler.forEach((k) => {
    mesaj += k.no + ") " + k.en + " × " + k.boy + " cm\n";
    mesaj += "▪️ Adet: " + k.adet + "\n";
    mesaj += "▪️ Tip: " + k.tip + "\n";
    mesaj += "▪️ Renk: " + k.renk + "\n\n";
  });

  mesaj += "━━━━━━━━━━━━━━\n\n";
  mesaj += "📦 Toplam Adet: " + sonAdet + "\n\n";
  mesaj += "Saygılarımızla\nOLKUN SİNEKLİK";

  window.open("https://wa.me/?text=" + encodeURIComponent(mesaj), "_blank");
}

function pdfOlustur() {
  hesapla();

  if (sonKalemler.length === 0) {
    alert("Ölçü giriniz");
    return;
  }

  document.getElementById("pTeklifNo").innerText = document.getElementById("teklifNo").value;
  document.getElementById("pTarih").innerText = document.getElementById("tarih").value;
  document.getElementById("pMusteri").innerText = document.getElementById("musteri").value || "-";
  document.getElementById("pTelefon").innerText = document.getElementById("telefon").value || "-";

  let html = "";

  sonKalemler.forEach((k) => {
    html += '<div class="print-item">' + k.no + ') ' +
      k.en + ' x ' + k.boy + ' cm - ' +
      k.adet + ' adet - ' +
      k.tip + ' - ' +
      k.renk + '</div>';
  });

  document.getElementById("pKalemler").innerHTML = html;
  document.getElementById("pToplamAdet").innerText = "Toplam Adet: " + sonAdet;
  document.getElementById("pFiyat").innerText = "Toplam Fiyat: " + tl(sonToplam);

  window.print();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tarih").value = bugun();
  document.getElementById("teklifNo").value = teklifNoUret();

  document.getElementById("mod").addEventListener("change", hesapla);
  document.getElementById("fiyatGorunum").addEventListener("change", hesapla);
  document.getElementById("hesaplaBtn").addEventListener("click", hesapla);
  document.getElementById("sifirlaBtn").addEventListener("click", sifirla);
  document.getElementById("satirEkleBtn").addEventListener("click", satirEkle);
  document.getElementById("whatsappBtn").addEventListener("click", whatsappGonder);
  document.getElementById("pdfBtn").addEventListener("click", pdfOlustur);

  for (let i = 0; i < 10; i++) satirEkle();
  hesapla();
});
