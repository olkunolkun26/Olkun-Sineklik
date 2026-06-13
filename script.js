let satirNo=0,sonKalemler=[],sonToplam=0,sonAdet=0,sonOnOdeme=0,sonKalan=0;
const STORAGE_KEY="olkun_sineklik_saved_quotes_v4";
function bugun(){const d=new Date();return String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear()}
function tl(n){return Math.round(n).toLocaleString("tr-TR")+" TL"}
function sayi(v){return parseFloat(String(v||"").replace(",","."))||0}
function satirEkle(data){satirNo++;const div=document.createElement("div");div.className="line";const renk=data?.renk||"beyaz";div.innerHTML=`<input class="en" type="number" placeholder="En" value="${data?.en||""}"><input class="boy" type="number" placeholder="Boy" value="${data?.boy||""}"><input class="renk" name="renk_${satirNo}" type="radio" value="renkli" ${renk==="renkli"?"checked":""}><input class="renk" name="renk_${satirNo}" type="radio" value="beyaz" ${renk!=="renkli"?"checked":""}><input class="adet" type="number" value="${data?.adet||1}" min="1"><input class="duble" type="checkbox" ${data?.duble?"checked":""}><div class="price">0 TL</div>`;document.getElementById("rows").appendChild(div);div.querySelectorAll("input").forEach(el=>{el.addEventListener("input",hesapla);el.addEventListener("change",hesapla)})}
function getRowsData(){return Array.from(document.querySelectorAll(".line")).map(row=>({en:row.querySelector(".en").value,boy:row.querySelector(".boy").value,adet:row.querySelector(".adet").value,renk:row.querySelector(".renk:checked").value,duble:row.querySelector(".duble").checked})).filter(r=>sayi(r.en)>0&&sayi(r.boy)>0)}

function sonKullaniciFiyati(en,boy,renk,duble){
  const alan = (en * boy) / 10000;
  let beyazStandart = 0;

  // 100x200 beyaz standart = 3500 TL baz alınır.
  // 60x120 civarı küçük ölçüler yaklaşık 1500 TL bandına iner.
  if (alan <= 2) {
    beyazStandart = 375 + (alan * 1562.5);
  } else {
    beyazStandart = 3500 + ((alan - 2) * 465);
  }

  // Çok geniş ölçülerde malzeme/işçilik artışını dengelemek için genişlik farkı eklenir.
  if (en > 300) {
    beyazStandart += (en - 300) * 12;
  }

  let fiyat = beyazStandart;

  if (renk === "renkli") {
    fiyat *= 1.15;
  }

  if (duble) {
    fiyat *= 1.40;
  }

  return Math.round(fiyat / 50) * 50;
}

function hesapla(){const rows=document.querySelectorAll(".line");let toplam=0,adetToplam=0;const kalemler=[];const mod=document.getElementById("mod").value;const fiyatGizli=document.getElementById("fiyatGorunum").value==="gizli";rows.forEach(row=>{const en=sayi(row.querySelector(".en").value);const boy=sayi(row.querySelector(".boy").value);let adet=sayi(row.querySelector(".adet").value);if(adet<=0)adet=1;const renk=row.querySelector(".renk:checked").value;const duble=row.querySelector(".duble").checked;let fiyat=0;if(en>0&&boy>0){const cevre=((en+boy)*2)/100;let bayi=192+(cevre*211);if(renk==="renkli")bayi*=1.15;if(duble)bayi*=1.40;fiyat=mod==="son"?sonKullaniciFiyati(en,boy,renk,duble):bayi;fiyat=Math.round(fiyat*adet);toplam+=fiyat;adetToplam+=adet;kalemler.push({no:kalemler.length+1,en,boy,adet,renk:renk==="renkli"?"Renkli":"Beyaz",tip:duble?"Duble":"Standart",fiyat})}row.querySelector(".price").innerText=fiyatGizli?"-":tl(fiyat)});sonKalemler=kalemler;sonToplam=Math.round(toplam);sonAdet=adetToplam;sonOnOdeme=Math.round(sayi(document.getElementById("onOdeme").value));sonKalan=Math.max(sonToplam-sonOnOdeme,0);document.getElementById("toplamAdet").innerText=sonAdet;document.getElementById("toplamFiyat").innerText=tl(sonToplam);document.getElementById("onOdemeGoster").innerText=tl(sonOnOdeme);document.getElementById("kalanGoster").innerText=tl(sonKalan)}
function sifirla(){document.getElementById("rows").innerHTML="";document.getElementById("musteri").value="";document.getElementById("telefon").value="";document.getElementById("adres").value="";document.getElementById("onOdeme").value="";sonKalemler=[];sonToplam=0;sonAdet=0;sonOnOdeme=0;sonKalan=0;for(let i=0;i<10;i++)satirEkle();hesapla()}
function yeniTeklif(){document.getElementById("welcomeScreen").classList.add("hidden");document.getElementById("quoteScreen").classList.remove("hidden");sifirla()}
function anaEkran(){document.getElementById("quoteScreen").classList.add("hidden");document.getElementById("welcomeScreen").classList.remove("hidden");document.getElementById("savedPanel").classList.add("hidden")}
function sonTekliflereGit(){document.getElementById("quoteScreen").classList.add("hidden");document.getElementById("welcomeScreen").classList.remove("hidden");document.getElementById("savedPanel").classList.remove("hidden");renderSavedList()}
function getSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch(e){return[]}}
function setSaved(list){localStorage.setItem(STORAGE_KEY,JSON.stringify(list.slice(0,30)))}
function teklifiKaydet(){hesapla();if(sonKalemler.length===0){alert("Kaydetmek için ölçü giriniz");return}const quote={id:Date.now(),date:document.getElementById("tarih").value,customer:document.getElementById("musteri").value||"İsimsiz müşteri",phone:document.getElementById("telefon").value||"",address:document.getElementById("adres").value||"",mod:document.getElementById("mod").value,fiyatGorunum:document.getElementById("fiyatGorunum").value,total:sonToplam,deposit:sonOnOdeme,remaining:sonKalan,adet:sonAdet,rows:getRowsData()};const list=getSaved();list.unshift(quote);setSaved(list);alert("Teklif kaydedildi");renderSavedList()}
function renderSavedList(){const list=getSaved();const box=document.getElementById("savedList");if(list.length===0){box.innerHTML='<div class="empty-save">Kayıtlı teklif yok</div>';return}box.innerHTML=list.map(q=>`<div class="saved-item"><div class="saved-title">${q.customer}</div><div class="saved-meta">${q.date} • ${q.adet} adet</div><div class="saved-money"><div><span>Toplam</span><strong>${tl(q.total||0)}</strong></div><div><span>Ön Ödeme</span><strong>${tl(q.deposit||0)}</strong></div><div><span>Kalan</span><strong>${tl(q.remaining??Math.max((q.total||0)-(q.deposit||0),0))}</strong></div></div><div class="saved-actions"><button class="load-btn" onclick="teklifiYukle(${q.id})">Aç</button><button class="paid-btn" onclick="odendi(${q.id})">Ödendi</button><button class="delete-btn" onclick="teklifiSil(${q.id})">Sil</button></div></div>`).join("")}
function teklifiSil(id){setSaved(getSaved().filter(q=>q.id!==id));renderSavedList()}
function odendi(id){if(confirm("Bu teklif ödendi olarak kapatılsın mı?")){teklifiSil(id)}}
function teklifiYukle(id){const q=getSaved().find(x=>x.id===id);if(!q)return;document.getElementById("welcomeScreen").classList.add("hidden");document.getElementById("quoteScreen").classList.remove("hidden");document.getElementById("savedPanel").classList.add("hidden");document.getElementById("tarih").value=q.date||bugun();document.getElementById("musteri").value=q.customer||"";document.getElementById("telefon").value=q.phone||"";document.getElementById("adres").value=q.address||"";document.getElementById("onOdeme").value=q.deposit||"";document.getElementById("mod").value=q.mod||"bayi";document.getElementById("fiyatGorunum").value=q.fiyatGorunum||"satir";document.getElementById("rows").innerHTML="";(q.rows||[]).forEach(r=>satirEkle(r));while(document.querySelectorAll(".line").length<10)satirEkle();hesapla()}
function whatsappGonder(){hesapla();if(sonKalemler.length===0){alert("Ölçü giriniz");return}let mesaj="OLKUN SİNEKLİK\\n";mesaj+="Tarih: "+document.getElementById("tarih").value+"\\n";mesaj+="Müşteri: "+(document.getElementById("musteri").value||"-")+"\\n";mesaj+="Adres: "+(document.getElementById("adres").value||"-")+"\\n";mesaj+="Tel: "+(document.getElementById("telefon").value||"-")+"\\n\\n";sonKalemler.forEach(k=>{mesaj+=k.no+") "+k.en+"x"+k.boy+" / "+k.adet+" Adet / "+k.tip+" / "+k.renk+"\\n"});mesaj+="\\nToplam Adet: "+sonAdet+"\\nOLKUN SİNEKLİK";window.open("https://wa.me/?text="+encodeURIComponent(mesaj),"_blank")}
function pdfOlustur(){hesapla();if(sonKalemler.length===0){alert("Ölçü giriniz");return}document.getElementById("pTarih").innerText=document.getElementById("tarih").value;document.getElementById("pMusteri").innerText=document.getElementById("musteri").value||"-";document.getElementById("pAdres").innerText=document.getElementById("adres").value||"-";document.getElementById("pTelefon").innerText=document.getElementById("telefon").value||"-";let html="";sonKalemler.forEach(k=>{html+='<div class="print-item">'+k.no+') '+k.en+' x '+k.boy+' cm - '+k.adet+' adet - '+k.tip+' - '+k.renk+'</div>'});document.getElementById("pKalemler").innerHTML=html;document.getElementById("pToplamAdet").innerText="Toplam Adet: "+sonAdet;document.getElementById("pFiyat").innerText="Toplam Fiyat: "+tl(sonToplam);document.getElementById("pOdeme").innerText="Ön Ödeme: "+tl(sonOnOdeme)+"\\nKalan: "+tl(sonKalan);window.print()}
document.addEventListener("DOMContentLoaded",()=>{document.getElementById("tarih").value=bugun();document.getElementById("startBtn").addEventListener("click",yeniTeklif);document.getElementById("showSavedBtn").addEventListener("click",()=>{document.getElementById("savedPanel").classList.remove("hidden");renderSavedList()});document.getElementById("closeSavedBtn").addEventListener("click",()=>document.getElementById("savedPanel").classList.add("hidden"));document.getElementById("backHomeBtn").addEventListener("click",anaEkran);document.getElementById("quoteSavedBtn").addEventListener("click",sonTekliflereGit);document.getElementById("mod").addEventListener("change",hesapla);document.getElementById("fiyatGorunum").addEventListener("change",hesapla);document.getElementById("onOdeme").addEventListener("input",hesapla);document.getElementById("hesaplaBtn").addEventListener("click",hesapla);document.getElementById("sifirlaBtn").addEventListener("click",sifirla);document.getElementById("satirEkleBtn").addEventListener("click",()=>satirEkle());document.getElementById("whatsappBtn").addEventListener("click",whatsappGonder);document.getElementById("pdfBtn").addEventListener("click",pdfOlustur);document.getElementById("saveBtn").addEventListener("click",teklifiKaydet);for(let i=0;i<10;i++)satirEkle();hesapla()})