/* Kimera ailesi · marka siteleri: dil, başlık, görünür olunca, talep kutusu (WhatsApp / arama) */
(function(){
  var root=document.documentElement;
  function lang(){ return root.getAttribute("data-lang")==="en"?"en":"tr"; }
  function setLang(l){ root.setAttribute("data-lang",l); root.lang=l; try{localStorage.setItem("kimera-lang",l);}catch(e){}
    document.querySelectorAll(".lg").forEach(function(b){ b.innerHTML = l==="tr" ? "<b>TR</b> <i>EN</i>" : "<i>TR</i> <b>EN</b>"; });
    document.querySelectorAll("[data-ask]").forEach(render); }
  var saved=null; try{saved=localStorage.getItem("kimera-lang");}catch(e){}
  document.addEventListener("click",function(e){ var b=e.target.closest(".lg"); if(b) setLang(lang()==="tr"?"en":"tr"); });

  var bh=document.querySelector(".bh");
  function sc(){ if(bh) bh.classList.toggle("solid", window.scrollY > window.innerHeight*0.6); }
  window.addEventListener("scroll",sc,{passive:true}); sc();

  var io="IntersectionObserver" in window ? new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target);} }); },{rootMargin:"0px 0px -8% 0px"}) : null;
  document.querySelectorAll("main h2, main .lead, main .stack, main figure, main .quote, main .list li").forEach(function(el,i){ el.classList.add("rv"); el.style.transitionDelay=(i%4)*70+"ms"; if(io) io.observe(el); else el.classList.add("in"); });

  document.querySelectorAll("video[data-src]").forEach(function(v){ var o=new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ if(!v.src) v.src=v.dataset.src; v.play().catch(function(){}); } else v.pause(); }); }); o.observe(v); });

  function today(){ var d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
  /* ana sitede seçilen konaklama ve son randevu günü/kişi sayısı burada da hazır gelsin */
  function rd(k){ var v=null; try{ v=localStorage.getItem(k); }catch(e){} if(v==null){ try{ v=sessionStorage.getItem(k); }catch(e){} } try{ return JSON.parse(v||"null"); }catch(e){ return null; } }
  function stay(){ var o=rd("kimera-stay"); return (o&&o.ci&&o.co&&o.co>today())?o:{}; }
  function plan(){ var o=rd("kimera-plan")||{}; if(o.date&&o.date<today()) delete o.date; return o; }
  function setPlan(k,v){ var o=plan(); o[k]=v; try{ localStorage.setItem("kimera-plan",JSON.stringify(o)); }catch(e){} }
  function pDate(){ var p=plan(), st=stay(), t=today(); if(p.date&&(!st.ci||(p.date>=st.ci&&p.date<=st.co))) return p.date; if(st.ci) return st.ci<t?t:st.ci; return p.date||""; }
  function pPeople(){ var p=plan(), st=stay(); return p.people||(st.ad?(st.ad+(st.ch||0)):0)||2; }
  function fd(v,l){ return v ? new Date(v+"T12:00:00").toLocaleDateString(l==="en"?"en-GB":"tr-TR",{day:"numeric",month:"long"}) : "…"; }
  function render(box){
    var cfg=JSON.parse(box.getAttribute("data-ask")), l=lang(), T=function(a,b){return l==="en"?b:a;}, keep=box.__v||{};
    var h='<div class="ask-f">';
    (cfg.f||[]).forEach(function(f){
      if(f.k==="date") h+='<label><span>'+T("Tarih","Date")+'</span><input type="date" name="date" min="'+today()+'" value="'+(keep.date||pDate())+'"></label>';
      if(f.k==="time"){ h+='<label><span>'+T(f.tr||"Saat",f.en||"Time")+'</span>';
        if(f.o){ h+='<select name="time">'; f.o.forEach(function(g){ h+='<optgroup label="'+T(g[0],g[1])+'">'+g[2].map(function(x){return '<option'+(keep.time===x?" selected":"")+'>'+x+'</option>';}).join("")+'</optgroup>'; }); h+='</select>'; }
        else h+='<input type="time" name="time" step="900" value="'+(keep.time||"")+'">';
        h+='</label>'; }
      if(f.k==="people"){ h+='<label><span>'+T("Kişi","Guests")+'</span><select name="people">'; for(var i=1;i<=(f.max||12);i++) h+='<option'+((keep.people||pPeople())==i?" selected":"")+'>'+i+'</option>'; h+='</select></label>'; }
      if(f.k==="opt"){ h+='<label class="w"><span>'+T(f.tr,f.en)+'</span><select name="opt">'; f.o.forEach(function(g){ if(g[0]) h+='<optgroup label="'+T(g[0],g[1])+'">'; g[2].forEach(function(x){ var v=x.split("|"), t=l==="en"&&v[1]?v[1]:v[0]; h+='<option'+(keep.opt===t?" selected":"")+'>'+t.replace(/&/g,"&amp;")+'</option>'; }); if(g[0]) h+='</optgroup>'; }); h+='</select></label>'; }
    });
    h+='</div><div class="go"><button type="button" class="btn op">'+T("İletişime geç","Get in touch")+'</button><div class="ch" hidden>'+
       '<a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/'+cfg.wa+'">'+T("WhatsApp'tan yaz","Message on WhatsApp")+'</a>'+
       '<a class="btn ghost" href="tel:'+cfg.tel+'"><span>'+T("Ara","Call")+' · '+cfg.telL+'</span></a></div></div><p class="pv" aria-live="polite"></p>';
    box.innerHTML=h;
    var wa=box.querySelector(".wa"), pv=box.querySelector(".pv");
    function v(n){ var e=box.querySelector('[name="'+n+'"]'); return e?e.value:""; }
    function upd(){ var o={opt:v("opt"),date:v("date"),time:v("time"),people:v("people")}; box.__v=o;
      var m=(cfg[l]||cfg.tr).replace("{opt}",o.opt).replace("{date}",fd(o.date,l)).replace("{time}",o.time||"…").replace("{people}",o.people||"…");
      wa.href="https://wa.me/"+cfg.wa+"?text="+encodeURIComponent(m); pv.textContent="“"+m+"”"; }
    box.addEventListener("change",upd); box.addEventListener("input",upd);
    box.addEventListener("change",function(e){ var n=e.target&&e.target.name; if(n==="date"||n==="people") setPlan(n,e.target.value); });
    var op=box.querySelector(".op"), ch=box.querySelector(".ch");
    op.addEventListener("click",function(){ upd(); ch.hidden=!ch.hidden; op.style.opacity=ch.hidden?"":".55"; });
    upd();
  }
  setLang(saved==="en"?"en":"tr");
})();
