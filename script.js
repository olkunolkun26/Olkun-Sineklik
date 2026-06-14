let girisTipi="bayi",bayiYetkili=false,satirNo=0,sonKalemler=[],sonToplam=0,sonAdet=0,sonOdenen=0,sonKalan=0,aktifKesim=null;
const STORAGE_KEY="olkun_stabil_teklifler_v5";
function $(id){return document.getElementById(id)}
function bugun(){const d=new Date();return String(d.getDate()).padStart(2,"0")+"."+String(d.getMonth()+1).padStart(2,"0")+"."+d.getFullYear()}
function tl(n){return Math.round(n).toLocaleString("tr-TR")+" TL"}
function sayi(v){return parseFloat(String(v||"").replace(",","."))||0}
function cm(v){const n=Math.round(Number(v)*10)/10;return Number.isInteger(n)?String(n):String(n).replace(".",",")}
function showHome(){bayiYetkili=false;$("quoteScreen").classList.add("hidden");$("homeScreen").classList.remove("hidden");$("savedBox").classList.add("hidden");$("cutBox").classList.add("hidden");$("passwordBox").classList.add("hidden");$("musteriSifreBox").classList.add("hidden")}
function showQuote(tip){girisTipi=tip;$("homeScreen").classList.add("hidden");$("quoteScreen").classList.remove("hidden");$("screenTitle").innerText=tip==="bayi"?"Bayi Teklif Ekranı":"Müşteri Teklif Ekranı";$("mod").value=tip==="bayi"?"bayi":"son";$("mod").disabled=true;$("onOdemeWrap").style.display="block";clearQuote()}
function sonTeklifSifreKontrol(){
  const sifre = prompt("Son Teklifler şifresini girin:");
  if (sifre !== "0000") {
    alert("Şifre hatalı");
    return false;
  }
  return true;
}
function showSaved(){
  if(!sonTeklifSifreKontrol()) return;
  $("savedBox").classList.remove("hidden");
  $("cutBox").classList.add("hidden");
  renderSavedList();
}
function hideSaved(){ $("savedBox").classList.add("hidden")}
function showSavedFromQuote(){
  if(!sonTeklifSifreKontrol()) return;
  $("quoteScreen").classList.add("hidden");
  $("homeScreen").classList.remove("hidden");
  $("savedBox").classList.remove("hidden");
  $("cutBox").classList.add("hidden");
  renderSavedList();
}
function sonKullaniciFiyati(en,boy,renk,duble){const alan=(en*boy)/10000;let baz=0;if(alan<=0.72)baz=1500;else if(alan<=1.368)baz=1500+((alan-0.72)*785);else if(alan<=2)baz=2009+((alan-1.368)*2360);else baz=3500+((alan-2)*500);if(en>300)baz+=(en-300)*12;if(renk==="renkli")baz*=1.12;if(duble)baz*=1.40;return Math.round(baz/50)*50}
function addRow(data={}){satirNo++;const div=document.createElement("div");div.className="line";const renk=data.renk||"beyaz";div.innerHTML=`<input class="en" type="number" placeholder="En" value="${data.en||""}"><input class="boy" type="number" placeholder="Boy" value="${data.boy||""}"><input class="renk" name="renk_${satirNo}" type="radio" value="renkli" ${renk==="renkli"?"checked":""}><input class="renk" name="renk_${satirNo}" type="radio" value="beyaz" ${renk!=="renkli"?"checked":""}><input class="adet" type="number" value="${data.adet||1}" min="1"><input class="duble" type="checkbox" ${data.duble?"checked":""}><div class="price">0 TL</div>`;$("rows").appendChild(div);div.querySelectorAll("input").forEach(el=>{el.addEventListener("input",()=>{calc();otomatikSatirKontrol()});el.addEventListener("change",()=>{calc();otomatikSatirKontrol()})})}
function getRowsData(){return Array.from(document.querySelectorAll(".line")).map(row=>({en:row.querySelector(".en").value,boy:row.querySelector(".boy").value,adet:row.querySelector(".adet").value,renk:row.querySelector(".renk:checked").value,duble:row.querySelector(".duble").checked})).filter(r=>sayi(r.en)>0&&sayi(r.boy)>0)}

function satirDoluMu(row){
  return sayi(row.querySelector(".en").value)>0 && sayi(row.querySelector(".boy").value)>0;
}

function otomatikSatirKontrol(){
  const rows=Array.from(document.querySelectorAll(".line"));
  if(rows.length===0){
    addRow();
    return;
  }
  const son=rows[rows.length-1];
  if(satirDoluMu(son)){
    addRow();
  }
}

function calc(){let toplam=0,adetToplam=0;const kalemler=[];const mod=girisTipi==="musteri"?"son":$("mod").value;const gizli=$("fiyatGorunum").value==="gizli";document.querySelectorAll(".line").forEach(row=>{const en=sayi(row.querySelector(".en").value),boy=sayi(row.querySelector(".boy").value);let adet=sayi(row.querySelector(".adet").value);if(adet<=0)adet=1;const renk=row.querySelector(".renk:checked").value,duble=row.querySelector(".duble").checked;let fiyat=0;if(en>0&&boy>0){const cevre=((en+boy)*2)/100;let bayi=192+(cevre*211);if(renk==="renkli")bayi*=1.15;if(duble)bayi*=1.40;fiyat=mod==="son"?sonKullaniciFiyati(en,boy,renk,duble):bayi;fiyat=Math.round(fiyat*adet);toplam+=fiyat;adetToplam+=adet;kalemler.push({no:kalemler.length+1,en,boy,adet,renk:renk==="renkli"?"Renkli":"Beyaz",tip:duble?"Duble":"Standart",fiyat})}row.querySelector(".price").innerText=gizli?"-":tl(fiyat)});sonKalemler=kalemler;sonToplam=Math.round(toplam);sonAdet=adetToplam;sonOdenen=Math.round(sayi($("onOdeme").value));sonKalan=Math.max(sonToplam-sonOdenen,0);$("totalQty").innerText=sonAdet;$("totalPrice").innerText=tl(sonToplam);$("paidShow").innerText=tl(sonOdenen);$("remainShow").innerText=tl(sonKalan)}
function clearQuote(){$("rows").innerHTML="";$("musteri").value="";$("telefon").value="";$("adres").value="";$("onOdeme").value="";$("tarih").value=bugun();addRow();calc()}
function getSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch(e){return[]}}
function setSaved(list){localStorage.setItem(STORAGE_KEY,JSON.stringify(list.slice(0,50)))}
function saveQuote(){calc();if(!sonKalemler.length){alert("Kaydetmek için ölçü giriniz");return}const quote={id:Date.now(),type:girisTipi,date:$("tarih").value,customer:$("musteri").value||"İsimsiz müşteri",phone:$("telefon").value||"",address:$("adres").value||"",mod:girisTipi==="musteri"?"son":$("mod").value,fiyatGorunum:$("fiyatGorunum").value,total:sonToplam,totalPaid:sonOdenen,remaining:sonKalan,adet:sonAdet,rows:getRowsData()};const list=getSaved();list.unshift(quote);setSaved(list);alert("Teklif kaydedildi")}
function renderSavedList(){
  const list=getSaved();

  if(!list.length){
    $("savedList").innerHTML='<div class="saved-item">Kayıtlı teklif yok</div>';
    return;
  }

  const bayiList=list.filter(q=>(q.type||"bayi")==="bayi");
  const musteriList=list.filter(q=>q.type==="musteri");

  function section(items,title){
    if(!items.length)return"";

    return '<div class="saved-section-title">'+title+'</div>'+items.map(q=>{
      const paid=q.totalPaid??0;
      const remain=Math.max((q.total||0)-paid,0);
      const tip=(q.type||"bayi")==="bayi"?"Bayi Teklifi":"Müşteri Teklifi";

      return `<div class="saved-item">
        <div class="saved-title">${q.customer}</div>
        <div class="saved-meta">${q.date} • ${q.adet} adet</div>
        <div class="saved-type">${tip}</div>
        <div class="saved-money">
          <div><span>Toplam</span><strong>${tl(q.total||0)}</strong></div>
          <div><span>Ödenen</span><strong>${tl(paid)}</strong></div>
          <div><span>Kalan</span><strong>${tl(remain)}</strong></div>
        </div>
        <div class="payment-add">
          <input id="ara_${q.id}" type="number" placeholder="Ara ödeme">
          <button type="button" onclick="addPayment(${q.id})">Ekle</button>
        </div>
        <div class="saved-actions">
          <button class="load-btn" type="button" onclick="loadQuote(${q.id})">Aç</button>
          <button class="cut-btn" type="button" onclick="showCut(${q.id})">Kesim Ölçüsü</button>
          <button class="paid-btn" type="button" onclick="markPaid(${q.id})">Ödendi</button>
          <button class="delete-btn" type="button" onclick="deleteQuote(${q.id})">Sil</button>
        </div>
      </div>`;
    }).join("");
  }

  $("savedTitle").innerText="Son Teklifler";
  $("savedList").innerHTML=section(bayiList,"Bayi Teklifleri")+section(musteriList,"Müşteri Teklifleri");
}
function addPayment(id){const input=$("ara_"+id);const tutar=sayi(input&&input.value);if(tutar<=0){alert("Ara ödeme tutarı giriniz");return}const list=getSaved();const q=list.find(x=>x.id===id);if(!q)return;q.totalPaid=Math.round((q.totalPaid??0)+tutar);q.remaining=Math.max((q.total||0)-q.totalPaid,0);setSaved(list);renderSavedList()}
function deleteQuote(id){setSaved(getSaved().filter(q=>q.id!==id));renderSavedList()}
function markPaid(id){if(confirm("Bu teklif ödendi olarak kapatılsın mı?"))deleteQuote(id)}
function loadQuote(id){const q=getSaved().find(x=>x.id===id);if(!q)return;const tip=q.type||"bayi";if(tip==="bayi"&&!bayiYetkili){const sifre=prompt("Bayi teklifini açmak için şifre girin:");if(sifre!=="4321"){alert("Şifre hatalı");return}bayiYetkili=true}girisTipi=tip;$("homeScreen").classList.add("hidden");$("quoteScreen").classList.remove("hidden");$("savedBox").classList.add("hidden");$("cutBox").classList.add("hidden");$("screenTitle").innerText=girisTipi==="bayi"?"Bayi Teklif Ekranı":"Müşteri Teklif Ekranı";$("mod").value=q.mod||(girisTipi==="musteri"?"son":"bayi");$("mod").disabled=true;$("onOdemeWrap").style.display="block";$("tarih").value=q.date||bugun();$("musteri").value=q.customer||"";$("telefon").value=q.phone||"";$("adres").value=q.address||"";$("onOdeme").value=q.totalPaid??0;$("fiyatGorunum").value=q.fiyatGorunum||"satir";$("rows").innerHTML="";(q.rows||[]).forEach(r=>addRow(r));otomatikSatirKontrol();calc()}
function cutCalc(en,boy){return{kesimEn:en-5.5,kesimBoy:boy-3.5,kanat:boy-9.2,tulBoyu:boy-6,tepe:Math.round(en*0.53),ip:((en+boy)*2)+30}}
function showCut(id){const q=getSaved().find(x=>x.id===id);if(!q)return;aktifKesim=q;$("savedBox").classList.add("hidden");$("cutBox").classList.remove("hidden");let html=`<div class="saved-title">${q.customer}</div><div class="saved-meta">${q.phone||"-"}<br>${q.address||"-"}</div>`;(q.rows||[]).forEach((r,i)=>{const en=sayi(r.en),boy=sayi(r.boy),adet=sayi(r.adet)||1,k=cutCalc(en,boy);const renk=r.renk==="renkli"?"Renkli":"Beyaz",tip=r.duble?"Duble":"Standart";html+=`<div class="cut-card"><b>${i+1}. ${en} × ${boy} cm • ${adet} Adet • ${tip} • ${renk}</b><div class="cut-grid"><div><span>Kesim En</span><strong>${cm(k.kesimEn)} cm</strong></div><div><span>Kesim Boy</span><strong>${cm(k.kesimBoy)} cm</strong></div><div><span>Kanat</span><strong>${cm(k.kanat)} cm</strong></div><div><span>Tül Boyu</span><strong>${cm(k.tulBoyu)} cm</strong></div><div><span>Tül Tepe</span><strong>${k.tepe}</strong></div><div><span>İp Uzunluğu</span><strong>${cm(k.ip)} cm</strong></div></div></div>`});$("cutContent").innerHTML=html}

function kesimRowsFromQuote(q){
  return (q.rows||[]).map((r,i)=>{
    const en=sayi(r.en), boy=sayi(r.boy), adet=sayi(r.adet)||1, k=cutCalc(en,boy);
    const renk=r.renk==="renkli"?"Renkli":"Beyaz";
    const tip=r.duble?"Duble":"Standart";
    return {
      no:i+1,
      bitmis:en+" × "+boy,
      adet:String(adet),
      tip:tip+" "+renk,
      kesimEn:cm(k.kesimEn),
      kesimBoy:cm(k.kesimBoy),
      kanat:cm(k.kanat),
      tulBoyu:cm(k.tulBoyu),
      tepe:String(k.tepe),
      ip:cm(k.ip)
    };
  });
}

function wrapText(ctx,text,x,y,maxWidth,lineHeight){
  const words=String(text).split(" ");
  let line="";
  let lines=0;
  for(let n=0;n<words.length;n++){
    const testLine=line+words[n]+" ";
    const metrics=ctx.measureText(testLine);
    if(metrics.width>maxWidth && n>0){
      ctx.fillText(line,x,y);
      line=words[n]+" ";
      y+=lineHeight;
      lines++;
    }else{
      line=testLine;
    }
  }
  ctx.fillText(line,x,y);
  return lines+1;
}

function canvasBlob(canvas){
  return new Promise(resolve=>canvas.toBlob(resolve,"image/png",0.95));
}

async function kesimGorselPaylas(){
  if(!aktifKesim){
    alert("Önce kesim ölçüsü açınız");
    return;
  }

  const rows=kesimRowsFromQuote(aktifKesim);
  if(!rows.length){
    alert("Kesim ölçüsü bulunamadı");
    return;
  }

  const w=1200;
  const headerH=210;
  const rowH=92;
  const h=headerH+(rows.length*rowH)+80;
  const canvas=document.createElement("canvas");
  canvas.width=w;
  canvas.height=h;
  const ctx=canvas.getContext("2d");

  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,w,h);

  ctx.fillStyle="#2C3136";
  ctx.fillRect(0,0,w,150);

  ctx.fillStyle="#D4AF37";
  ctx.font="bold 42px Arial";
  ctx.fillText("OLKUN SİNEKLİK",40,60);
  ctx.font="bold 30px Arial";
  ctx.fillText("KESİM ÖLÇÜLERİ",40,108);

  ctx.fillStyle="#ffffff";
  ctx.font="22px Arial";
  ctx.fillText("Müşteri: "+(aktifKesim.customer||"-"),520,52);
  ctx.fillText("Telefon: "+(aktifKesim.phone||"-"),520,86);
  ctx.fillText("Adres: "+(aktifKesim.address||"-"),520,120);

  const columns=[
    ["No",35,55],
    ["Bitmiş",95,135],
    ["Adet",240,70],
    ["Ürün",320,150],
    ["K.En",490,90],
    ["K.Boy",600,90],
    ["Kanat",710,90],
    ["Tül",820,90],
    ["Tepe",930,80],
    ["İp",1030,110]
  ];

  let y=170;
  ctx.fillStyle="#f0f2f4";
  ctx.fillRect(25,y,w-50,42);
  ctx.fillStyle="#2C3136";
  ctx.font="bold 22px Arial";
  columns.forEach(c=>ctx.fillText(c[0],c[1],y+28));

  y+=42;
  ctx.font="20px Arial";

  rows.forEach((r,idx)=>{
    ctx.fillStyle=idx%2===0?"#ffffff":"#f8f9fa";
    ctx.fillRect(25,y,w-50,rowH);
    ctx.strokeStyle="#e2e2e2";
    ctx.strokeRect(25,y,w-50,rowH);

    ctx.fillStyle="#222831";
    ctx.font="bold 21px Arial";
    ctx.fillText(r.no,35,y+36);
    ctx.fillText(r.bitmis,95,y+36);
    ctx.fillText(r.adet,250,y+36);

    ctx.font="19px Arial";
    wrapText(ctx,r.tip,320,y+34,140,24);

    ctx.font="bold 20px Arial";
    ctx.fillText(r.kesimEn,490,y+36);
    ctx.fillText(r.kesimBoy,600,y+36);
    ctx.fillText(r.kanat,710,y+36);
    ctx.fillText(r.tulBoyu,820,y+36);
    ctx.fillText(r.tepe,940,y+36);
    ctx.fillText(r.ip,1030,y+36);

    y+=rowH;
  });

  ctx.fillStyle="#2C3136";
  ctx.font="bold 24px Arial";
  ctx.fillText("OLKUN SİNEKLİK",40,h-32);

  const blob=await canvasBlob(canvas);
  const fileName="olkun-kesim-olculeri.png";
  const file=new File([blob],fileName,{type:"image/png"});

  if(navigator.canShare && navigator.canShare({files:[file]})){
    await navigator.share({
      files:[file],
      title:"OLKUN SİNEKLİK Kesim Ölçüleri",
      text:"Kesim ölçüleri"
    });
  }else{
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert("Kesim görseli indirildi. WhatsApp'tan görsel olarak gönderebilirsiniz.");
  }
}

function printCut(){if(!aktifKesim)return;$("cpMusteri").innerText=aktifKesim.customer||"-";$("cpTelefon").innerText=aktifKesim.phone||"-";$("cpAdres").innerText=aktifKesim.address||"-";let html="";(aktifKesim.rows||[]).forEach((r,i)=>{const en=sayi(r.en),boy=sayi(r.boy),adet=sayi(r.adet)||1,k=cutCalc(en,boy);html+=`<div class="print-item"><b>${i+1}) Bitmiş: ${en} × ${boy} cm - ${adet} Adet</b><br>Kesim En: ${cm(k.kesimEn)} cm<br>Kesim Boy: ${cm(k.kesimBoy)} cm<br>Kanat: ${cm(k.kanat)} cm<br>Tül Boyu: ${cm(k.tulBoyu)} cm<br>Tül Tepe: ${k.tepe}<br>İp Uzunluğu: ${cm(k.ip)} cm</div>`});$("cpRows").innerHTML=html;$("cutPrintArea").classList.add("print-active");window.print();setTimeout(()=>$("cutPrintArea").classList.remove("print-active"),500)}
function sendWhatsApp(){calc();if(!sonKalemler.length){alert("Ölçü giriniz");return}const lines=[];lines.push("📋 *OLKUN SİNEKLİK TEKLİFİ*");lines.push("📅 "+$("tarih").value);lines.push("");lines.push("👤 *Müşteri:* "+($("musteri").value||"-"));lines.push("📞 *Telefon:* "+($("telefon").value||"-"));lines.push("📍 *Adres:* "+($("adres").value||"-"));lines.push("");lines.push("━━━━━━━━━━━━━━━━━━━━");sonKalemler.forEach(k=>{let urun=k.tip==="Duble"?"Duble "+k.renk:k.renk;lines.push("");lines.push("*"+k.no+". Sineklik*");lines.push("Ölçü : "+k.en+" × "+k.boy+" cm");lines.push("Ürün : "+urun);lines.push("Adet : "+k.adet)});lines.push("");lines.push("━━━━━━━━━━━━━━━━━━━━");lines.push("📦 *Toplam Adet:* "+sonAdet);lines.push("");lines.push("*OLKUN SİNEKLİK*");window.open("https://wa.me/?text="+encodeURIComponent(lines.join("\n")),"_blank")}
function printQuote(){calc();if(!sonKalemler.length){alert("Ölçü giriniz");return}$("pTarih").innerText=$("tarih").value;$("pMusteri").innerText=$("musteri").value||"-";$("pTelefon").innerText=$("telefon").value||"-";$("pAdres").innerText=$("adres").value||"-";$("pRows").innerHTML=sonKalemler.map(k=>`<div class="print-item">${k.no}) ${k.en} × ${k.boy} cm - ${k.adet} Adet - ${k.tip} - ${k.renk}</div>`).join("");$("pTotal").innerText="Toplam: "+tl(sonToplam);$("pPayment").innerText="Ödenen: "+tl(sonOdenen)+" / Kalan: "+tl(sonKalan);$("printArea").classList.add("print-active");window.print();setTimeout(()=>$("printArea").classList.remove("print-active"),500)}
function bind(){$("bayiBtn").onclick=()=>$("passwordBox").classList.remove("hidden");$("musteriBtn").onclick=()=>$("musteriSifreBox").classList.remove("hidden");$("homeSavedBtn").onclick=showSaved;$("passCancelBtn").onclick=()=>$("passwordBox").classList.add("hidden");$("musteriPassCancelBtn").onclick=()=>$("musteriSifreBox").classList.add("hidden");$("musteriPassOkBtn").onclick=()=>{if($("musteriPass").value==="1234"){$("musteriPass").value="";$("musteriSifreBox").classList.add("hidden");showQuote("musteri")}else alert("Şifre hatalı")};$("musteriPass").addEventListener("keydown",e=>{if(e.key==="Enter")$("musteriPassOkBtn").click()});$("passOkBtn").onclick=()=>{if($("bayiPass").value==="4321"){bayiYetkili=true;$("bayiPass").value="";$("passwordBox").classList.add("hidden");showQuote("bayi")}else alert("Şifre hatalı")};$("bayiPass").addEventListener("keydown",e=>{if(e.key==="Enter")$("passOkBtn").click()});$("savedCloseBtn").onclick=hideSaved;$("homeBtn").onclick=showHome;$("cutCloseBtn").onclick=()=>{$("cutBox").classList.add("hidden");$("savedBox").classList.remove("hidden")};$("cutPrintBtn").onclick=printCut;$("cutShareBtn").onclick=kesimGorselPaylas;$("calcBtn").onclick=calc;$("clearBtn").onclick=clearQuote;$("saveBtn").onclick=saveQuote;$("whatsappBtn").onclick=sendWhatsApp;$("pdfBtn").onclick=printQuote;$("addRowBtn").onclick=()=>addRow();["mod","fiyatGorunum","onOdeme"].forEach(id=>$(id).addEventListener("input",calc));$("tarih").value=bugun();addRow();calc()}
document.addEventListener("DOMContentLoaded",bind);
