(()=>{
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sb=window.sb,FEE=.1,page=document.body.dataset.page;
const ICON={design:'<i class="i i-palette"></i> ',web:'<i class="i i-monitor"></i> ',marketing:'<i class="i i-megaphone"></i> ',redaction:'<i class="i i-pen"></i> ',traduction:'<i class="i i-globe"></i> '};
const NAMES={design:'Design',web:'Web',marketing:'Marketing',redaction:'Rédaction',traduction:'Traduction'};
const ST={new:'🆕 Nouvelle',prep:'👩‍🍳 En préparation',done:'✅ Terminée',cancel:'❌ Annulée'};
const money=c=>(c/100).toFixed(2)+' DT';
const DEMO=[
['logo','Logo et mini charte','design','Un logo original pour votre marque.','2 propositions, 2 retouches',6000],
['site','Site vitrine d’une page','web','Une page web claire et adaptée au mobile.','Responsive, 1 révision',15000],
['posts','Pack de 8 posts réseaux sociaux','marketing','Visuels et textes prêts à publier.','8 visuels, légendes',4500],
['article','Article de blog (600 mots)','redaction','Un article optimisé et original.','1 relecture',2500],
['trad','Traduction FR/EN (1000 mots)','traduction','Traduction soignée de vos documents.','Relecture incluse',3000]
].map(a=>({id:a[0],name:a[1],category:a[2],description:a[3],features:a[4],price_cents:a[5],available:true}));
let user=null,isAdmin=false,products=[];
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const getCart=()=>store.get('mi_cart',{});
function toast(m,bad){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.append(t)}t.textContent=m;t.className='show'+(bad?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',5000)}
function shell(){
 const n=Object.values(getCart()).reduce((a,b)=>a+b,0);
 $('#top').innerHTML=`<a class="brand" href="index.html"><span class="logo"><i class="i i-leaf"></i></span>MicroIntern</a><nav><a href="index.html#services"><i class="i i-bag"></i> Services</a><a href="index.html#faq"><i class="i i-help"></i> FAQ</a><a href="index.html#contact"><i class="i i-mailbox"></i> Contact</a><a href="index.html#panier"><i class="i i-cart"></i> Panier (${n})</a>${isAdmin?'<a href="admin.html"><i class="i i-sliders"></i> Admin</a>':''}${user?'<a href="compte.html"><i class="i i-user"></i> Mon compte</a><button class="link" id="out"><i class="i i-logout"></i> Quitter</button>':'<a href="login.html">🔑 Connexion</a>'}</nav>`;
 $('#foot').innerHTML='<footer><div class="fcols"><div><b>🌱 MicroIntern</b><p>Des missions courtes pour des étudiants, des compétences rapides pour les entreprises.</p></div><div><b>Plateforme</b><a href="index.html#services">Services</a><a href="index.html#faq">FAQ</a><a href="index.html#contact">Contact</a></div><div><b>Informations</b><a href="legal.html#mentions">Mentions légales</a><a href="legal.html#cgu">Conditions d’utilisation</a><a href="legal.html#confidentialite">Confidentialité</a></div></div><p class="mute">Projet étudiant. Les paiements sont simulés : aucune donnée bancaire n’est demandée.</p></footer>';
 const o=$('#out');if(o)o.onclick=async()=>{await sb.auth.signOut();location.href='index.html'};
}
async function loadProducts(){
 if(!sb){products=DEMO;return}
 const{data,error}=await sb.from('products').select('*').eq('available',true).order('created_at');
 if(error){toast('Impossible de charger les services : '+error.message,1);products=[];return}
 products=data;
 try{const{data:rt}=await sb.from('product_ratings').select('*');const mp=Object.fromEntries((rt||[]).map(r=>[r.product_id,r]));products.forEach(p=>p.rt=mp[p.id])}catch{}
}
async function home(){
 await loadProducts();let cat='all';
 const fl=$('#flt');
 const drawF=()=>{fl.innerHTML=['all',...Object.keys(NAMES)].map(c=>`<button data-c="${c}" aria-pressed="${c===cat}">${c==='all'?'<i class="i i-sparkles"></i> Tous':ICON[c]+' '+NAMES[c]}</button>`).join('')};
 const drawG=()=>{const q=($('#q').value||'').trim().toLowerCase(),so=$('#sort').value;let l=products.filter(p=>(cat==='all'||p.category===cat)&&(!q||(p.name+' '+(p.description||'')).toLowerCase().includes(q)));if(so)l=[...l].sort((a,b)=>so==='asc'?a.price_cents-b.price_cents:b.price_cents-a.price_cents);$('#count').textContent=l.length+' service'+(l.length>1?'s':'')+' disponible'+(l.length>1?'s':'');
  $('#grid').innerHTML=l.length?l.map(p=>`<article class="card c-${esc(p.category)}"><div class="ic">${ICON[p.category]||'<i class="i i-sparkles"></i> '}</div><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><p class="feat"><i class="i i-package"></i> ${esc(p.features)}</p>${p.owner_name?`<p class="feat"><i class="i i-grad"></i> Proposé par ${esc(p.owner_name)}</p>`:''}${p.rt?`<p class="feat"><i class="i i-star"></i> ${p.rt.avg_rating}/5 (${p.rt.n} avis)</p>`:'<p class="feat">Nouveau</p>'}<div class="row"><strong><i class="i i-tag"></i> ${money(p.price_cents)}</strong><button class="btn sm" data-add="${esc(p.id)}"><i class="i i-plus"></i> Ajouter</button></div></article>`).join(''):'<p class="empty"><i class="i i-inbox"></i> Aucun service pour le moment. Revenez bientôt !</p>'};
 function drawC(){
  const c=getCart(),rows=Object.entries(c).map(([id,q])=>({p:products.find(x=>x.id===id),q})).filter(r=>r.p);
  const sub=rows.reduce((a,r)=>a+r.p.price_cents*r.q,0),fee=Math.round(sub*FEE);
  $('#cart').innerHTML=rows.length?`<ul class="lines">${rows.map(r=>`<li>${ICON[r.p.category]||'<i class="i i-sparkles"></i> '} ${esc(r.p.name)}<span>${r.q} × ${money(r.p.price_cents)}</span><button class="link" data-dec="${esc(r.p.id)}" aria-label="Retirer un"><i class="i i-minus"></i> </button><button class="link" data-inc="${esc(r.p.id)}" aria-label="Ajouter un"><i class="i i-plus"></i> </button></li>`).join('')}</ul><p><i class="i i-receipt"></i> Sous-total : ${money(sub)}</p><p><i class="i i-sparkles"></i> Commission plateforme (10 %) : ${money(fee)}</p><p class="tot"><i class="i i-sparkles"></i> Total : ${money(sub+fee)}</p>`:'<p class="empty"><i class="i i-cart"></i> Votre panier est vide. Ajoutez un service ci-dessus !</p>';
  $('#checkout').hidden=!rows.length;shell();return sub+fee};
 const chg=(id,d)=>{const c=getCart();c[id]=Math.min(20,(c[id]||0)+d);if(c[id]<=0)delete c[id];store.set('mi_cart',c);drawC()};
 fl.onclick=e=>{const b=e.target.closest('[data-c]');if(b){cat=b.dataset.c;drawF();drawG()}};
 $('#grid').onclick=e=>{const b=e.target.closest('[data-add]');if(b){chg(b.dataset.add,1);toast('Ajouté au panier !')}};
 $('#cart').onclick=e=>{const a=e.target.closest('[data-inc]'),d=e.target.closest('[data-dec]');if(a)chg(a.dataset.inc,1);if(d)chg(d.dataset.dec,-1)};
 $('#checkout').onsubmit=async e=>{e.preventDefault();
  if(!sb)return toast('Supabase n’est pas encore configuré (voir SUPABASE.md).',1);
  if(!user){location.href='login.html?next='+encodeURIComponent('index.html#panier');return}
  const btn=$('#checkout button[type=submit]');if(btn.disabled)return;btn.disabled=true;
  const c=getCart(),total=drawC(),f=new FormData(e.target);
  let att=sessionStorage.getItem('mi_att');if(!att){att=crypto.randomUUID();sessionStorage.setItem('mi_att',att)}
  const{data,error}=await sb.rpc('create_demo_order',{p_attempt:att,p_items:Object.entries(c).map(([id,qty])=>({id,qty})),p_contact:Object.fromEntries(f),p_expected_total:total});
  btn.disabled=false;
  if(error)return toast('Commande non enregistrée : '+error.message+'. Votre panier est conservé.',1);
  localStorage.removeItem('mi_cart');sessionStorage.removeItem('mi_att');e.target.reset();drawC();
  $('#done').hidden=false;$('#done').textContent='Merci ! Commande '+data.reference+' enregistrée (paiement simulé).'};
 $('#q').oninput=drawG;$('#sort').onchange=drawG;
 $('#cf').onsubmit=async e=>{e.preventDefault();if(!sb)return toast('Le formulaire sera actif une fois Supabase configuré.',1);const f=e.target,b=f.querySelector('button');if(b.disabled)return;b.disabled=true;const d=new FormData(f);const{error}=await sb.from('contact_messages').insert({name:d.get('name').trim(),email:d.get('email').trim(),message:d.get('message').trim()});b.disabled=false;if(error)return toast('Message non envoyé : '+error.message,1);f.reset();toast('Message envoyé, merci !')};
 drawF();drawG();drawC();
}
function login(){
 if(!sb)$('#cfg').hidden=false;
 const nx=new URLSearchParams(location.search).get('next'),dest=nx&&/^[\w.-]+(#\w+)?$/.test(nx)?nx:'compte.html';
 if(user){location.href=dest;return}
 const msg=(t,bad)=>{$('#msg').textContent=t;$('#msg').className=bad?'err':'ok'};
 const tab=up=>{$('#fin').hidden=up;$('#fup').hidden=!up;$('#ffg').hidden=true};
 $('#t1').onclick=()=>tab(false);$('#t2').onclick=()=>tab(true);
 $('#fgl').onclick=()=>{$('#fin').hidden=true;$('#fup').hidden=true;$('#ffg').hidden=false};
 $('#ffg').onsubmit=async e=>{e.preventDefault();if(!sb)return msg('Supabase n’est pas configuré.',1);const{error}=await sb.auth.resetPasswordForEmail(new FormData(e.target).get('email'),{redirectTo:location.origin+location.pathname.replace(/[^/]*$/,'')+'reset.html'});error?msg('Envoi impossible : '+error.message,1):msg('Si un compte existe avec cet e-mail, un lien de réinitialisation vient d’être envoyé. Vérifiez vos spams.')};
 $('#fin').onsubmit=async e=>{e.preventDefault();if(!sb)return msg('Supabase n’est pas configuré.',1);
  const f=new FormData(e.target),{error}=await sb.auth.signInWithPassword({email:f.get('email'),password:f.get('pw')});
  if(error)return msg('Connexion impossible : '+error.message+'. Vérifiez vos identifiants et que votre e-mail est confirmé.',1);
  const{data}=await sb.auth.getUser();if(data.user)location.href=dest};
 $('#fup').onsubmit=async e=>{e.preventDefault();if(!sb)return msg('Supabase n’est pas configuré.',1);
  const f=new FormData(e.target);if(f.get('pw')!==f.get('pw2'))return msg('Les mots de passe sont différents.',1);
  const{error}=await sb.auth.signUp({email:f.get('email'),password:f.get('pw'),options:{data:{first_name:f.get('fn'),last_name:f.get('ln'),account_type:f.get('type')},emailRedirectTo:location.origin+location.pathname.replace(/[^/]*$/,'')+'login.html'}});
  if(error)return msg('Inscription impossible : '+error.message,1);
  msg('Compte créé. Un e-mail de confirmation est demandé à Supabase : ouvrez-le (vérifiez les spams), puis connectez-vous.')};
}
function resetPage(){
 const say=(t,bad)=>{$('#msg').textContent=t;$('#msg').className=bad?'err':'ok'};
 if(!sb||!user){$('#frs').hidden=true;say('Ce lien est invalide ou a expiré. Redemandez un lien depuis la page de connexion.',1);return}
 $('#frs').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);if(f.get('pw')!==f.get('pw2'))return say('Les mots de passe sont différents.',1);
  const{error}=await sb.auth.updateUser({password:f.get('pw')});
  if(error)return say('Changement impossible : '+error.message,1);say('Mot de passe modifié. Redirection…');setTimeout(()=>location.href='compte.html',1500)};
}
const detail=o=>`<ul>${(o.items||[]).map(i=>`<li>${esc(i.name)} : ${i.qty} × ${money(i.price_cents)}</li>`).join('')}</ul><p><i class="i i-receipt"></i> Sous-total ${money(o.subtotal_cents)}, commission ${money(o.fee_cents)}, total <b>${money(o.total_cents)}</b></p><p><i class="i i-user"></i> ${esc(o.contact?.nom)}, ${esc(o.contact?.entreprise)}, ${esc(o.contact?.email)}, ${esc(o.contact?.tel)}</p><p><i class="i i-message"></i> ${esc(o.contact?.message)}</p><p><i class="i i-card"></i> Paiement simulé : ${esc(o.payment)}</p>`;
async function compte(){
 if(!user){location.href='login.html?next=compte.html';return}
 const m=user.user_metadata||{};$('#who').textContent=`${m.first_name||''} ${m.last_name||''} (${user.email}), compte ${m.account_type==='student'?'étudiant':m.account_type==='company'?'entreprise':''}`;
 async function drawOrders(){
  const[{data,error},{data:rv}]=await Promise.all([sb.from('orders').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100),sb.from('reviews').select('order_id,product_id').eq('user_id',user.id)]);
  const done=new Set((rv||[]).map(r=>r.order_id+'|'+r.product_id));
  $('#list').innerHTML=error?`<p class="err"><i class="i i-warn"></i> ${esc(error.message)}</p>`:data.length?data.map(o=>`<details class="ord"><summary><i class="i i-receipt"></i> ${esc(o.reference)} : ${new Date(o.created_at).toLocaleDateString('fr-FR')}, ${money(o.total_cents)}, <span class="badge s-${esc(o.status)}">${ST[o.status]||esc(o.status)}</span></summary>${detail(o)}${o.status==='done'?(o.items||[]).filter(i=>!done.has(o.id+'|'+i.id)).map(i=>`<form class="rv" data-o="${esc(o.id)}" data-p="${esc(i.id)}"><b>Noter : ${esc(i.name)}</b><select name="r" aria-label="Note"><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select><input name="c" maxlength="300" placeholder="Votre avis (facultatif)"><button class="btn sm" type="submit">Envoyer</button></form>`).join(''):''}</details>`).join(''):'<p class="empty"><i class="i i-inbox"></i> Pas encore de commande. Découvrez les services !</p>'}
 await drawOrders();
 $('#list').onsubmit=async e=>{const f=e.target;if(!f.classList.contains('rv'))return;e.preventDefault();const b=f.querySelector('button');if(b.disabled)return;b.disabled=true;
  const{error}=await sb.from('reviews').insert({order_id:f.dataset.o,product_id:f.dataset.p,rating:+f.elements.r.value,comment:f.elements.c.value.trim()||null});b.disabled=false;
  error?toast('Avis non envoyé : '+error.message,1):(toast('Merci pour votre avis !'),drawOrders())};
 if(m.account_type!=='student'){$('#stu').remove();return}
 const sf=$('#sf'),sl=$('#sl');let mineData=[];
 async function mine(){const{data,error}=await sb.from('products').select('*').eq('owner_id',user.id).order('created_at',{ascending:false});mineData=data||[];
  sl.innerHTML=error?`<p class="err">😕 ${esc(error.message)}</p>`:mineData.length?mineData.map(p=>`<div class="box row"><span>${ICON[p.category]||'⭐'} <b>${esc(p.name)}</b> : ${money(p.price_cents)} <span class="badge">${p.available?'En ligne':'Masqué'}</span></span><span><button class="btn sm alt" data-tg="${esc(p.id)}">${p.available?'🙈 Masquer':'👀 Publier'}</button><button class="btn sm alt" data-rm="${esc(p.id)}">🗑️ Supprimer</button></span></div>`).join(''):'<p class="empty">🍃 Vous n’avez pas encore proposé de service.</p>'}
 sl.onclick=async e=>{const t=e.target.closest('[data-tg]'),r=e.target.closest('[data-rm]');
  if(t){const p=mineData.find(x=>x.id===t.dataset.tg);const{error}=await sb.from('products').update({available:!p.available}).eq('id',p.id);error?toast(error.message,1):mine()}
  if(r&&confirm('Supprimer ce service définitivement ?')){const{error}=await sb.from('products').delete().eq('id',r.dataset.rm);error?toast(error.message,1):(toast('Service supprimé'),mine())}};
 sf.onsubmit=async e=>{e.preventDefault();const b=sf.querySelector('[type=submit]');if(b.disabled)return;b.disabled=true;
  const f=new FormData(sf),nm=f.get('name').trim(),slug=nm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)||'service';
  const row={id:slug+'-'+Math.random().toString(36).slice(2,7),name:nm,category:f.get('category'),price_cents:Math.round(parseFloat(f.get('price'))*100),description:f.get('description'),features:f.get('features'),available:true};
  const{error}=await sb.from('products').insert(row);b.disabled=false;
  if(error)return toast('Service non publié : '+error.message,1);
  toast('Service publié ! Il apparaît sur la page d’accueil.');sf.reset();mine()};
 mine();
}
async function admin(){
 if(!user){location.href='login.html?next=admin.html';return}
 if(!isAdmin){$('#deny').hidden=false;return}
 $('#adm').hidden=false;let from=0;const PAGE=50;
 async function load(reset){
  if(reset){from=0;$('#orders').innerHTML='<p><i class="i i-clock"></i> Chargement…</p>'}
  let q=sb.from('orders').select('*').order('created_at',{ascending:false}).range(from,from+PAGE-1);
  if($('#of').value)q=q.eq('status',$('#of').value);
  const{data,error}=await q;
  if(error){$('#orders').innerHTML=`<p class="err"><i class="i i-warn"></i> ${esc(error.message)}</p>`;return}
  const h=data.map(o=>`<details class="ord" data-id="${esc(o.id)}" data-v="${esc(o.updated_at)}"><summary><i class="i i-receipt"></i> ${esc(o.reference)} : ${new Date(o.created_at).toLocaleDateString('fr-FR')}, ${esc(o.contact?.nom)}, ${money(o.total_cents)}, <span class="badge s-${esc(o.status)}">${ST[o.status]||esc(o.status)}</span></summary>${detail(o)}<label><i class="i i-tag"></i> Statut<select>${Object.entries(ST).map(([k,v])=>`<option value="${k}"${k===o.status?' selected':''}>${v}</option>`).join('')}</select></label><button class="btn sm" data-save><i class="i i-save"></i> Enregistrer le statut</button></details>`).join('');
  if(reset)$('#orders').innerHTML=h||'<p class="empty"><i class="i i-inbox"></i> Aucune commande.</p>';else $('#orders').insertAdjacentHTML('beforeend',h);
  from+=data.length;$('#more').hidden=data.length<PAGE};
 $('#of').onchange=()=>load(true);$('#ref').onclick=()=>load(true);$('#more').onclick=()=>load(false);
 $('#orders').onclick=async e=>{const b=e.target.closest('[data-save]');if(!b||b.disabled)return;b.disabled=true;
  const d=b.closest('.ord'),now=new Date().toISOString();
  const{data,error}=await sb.from('orders').update({status:d.querySelector('select').value,updated_at:now}).eq('id',d.dataset.id).eq('updated_at',d.dataset.v).select();
  b.disabled=false;
  if(error)return toast('Erreur : '+error.message,1);
  if(!data.length){toast('Cette commande a été modifiée ailleurs. Actualisez la liste.',1);return}
  d.dataset.v=data[0].updated_at;toast('Statut enregistré !')};
 let all=[];const pf=$('#pf');
 async function loadP(){const{data,error}=await sb.from('products').select('*').order('created_at');if(error)return toast(error.message,1);all=data;
  $('#plist').innerHTML=data.map(p=>`<div class="box row"><span>${ICON[p.category]||'<i class="i i-sparkles"></i> '} <b>${esc(p.name)}</b> (${esc(p.id)}) : ${money(p.price_cents)} ${p.available?'<i class="i i-eye"></i> ':'<i class="i i-eyeoff"></i> '}</span><span><button class="btn sm" data-ed="${esc(p.id)}"><i class="i i-pen"></i> Modifier</button><button class="btn sm alt" data-del="${esc(p.id)}"><i class="i i-trash"></i> Supprimer</button></span></div>`).join('')||'<p class="empty"><i class="i i-inbox"></i> Aucun service.</p>'}
 const reset=()=>{pf.reset();pf.id.readOnly=false;$('#pt').textContent='Ajouter un service'};
 $('#pn').onclick=reset;
 $('#plist').onclick=async e=>{const ed=e.target.closest('[data-ed]'),dl=e.target.closest('[data-del]');
  if(ed){const p=all.find(x=>x.id===ed.dataset.ed);pf.id.value=p.id;pf.id.readOnly=true;pf.name.value=p.name;pf.category.value=p.category;pf.price.value=(p.price_cents/100).toFixed(2);pf.image.value=p.image||'';pf.description.value=p.description||'';pf.features.value=p.features||'';pf.available.checked=p.available;$('#pt').textContent='Modifier un service';pf.scrollIntoView()}
  if(dl&&confirm('Supprimer ce service définitivement ?')){const{error}=await sb.from('products').delete().eq('id',dl.dataset.del);error?toast(error.message,1):(toast('Supprimé'),loadP())}};
 pf.onsubmit=async e=>{e.preventDefault();const b=pf.querySelector('[type=submit]');if(b.disabled)return;b.disabled=true;
  const row={id:pf.id.value.trim(),name:pf.name.value.trim(),category:pf.category.value,price_cents:Math.round(parseFloat(pf.price.value)*100),image:pf.image.value||null,description:pf.description.value,features:pf.features.value,available:pf.available.checked};
  const{error}=await sb.from('products').upsert(row);b.disabled=false;
  if(error)return toast('Erreur : '+error.message,1);toast('Service enregistré !');reset();loadP()};
 async function loadM(){const{data,error}=await sb.from('contact_messages').select('*').order('created_at',{ascending:false}).limit(50);
  $('#msgs').innerHTML=error?`<p class="err">${esc(error.message)}</p>`:data.length?data.map(x=>`<div class="box"><b>${esc(x.name)}</b> (${esc(x.email)}) : ${new Date(x.created_at).toLocaleDateString('fr-FR')} <span class="badge">${x.handled?'Traité':'Nouveau'}</span><p>${esc(x.message)}</p><button class="btn sm alt" data-h="${esc(x.id)}" data-v="${x.handled?0:1}">${x.handled?'Marquer non traité':'Marquer traité'}</button></div>`).join(''):'<p class="empty">Aucun message.</p>'}
 $('#msgs').onclick=async e=>{const b=e.target.closest('[data-h]');if(!b)return;const{error}=await sb.from('contact_messages').update({handled:b.dataset.v==='1'}).eq('id',b.dataset.h);error?toast(error.message,1):loadM()};
 load(true);loadP();loadM();
}
(async()=>{
 if(sb){const{data}=await sb.auth.getSession();user=data.session?.user||null;
  if(user){const{data:r}=await sb.from('user_roles').select('role').eq('user_id',user.id).maybeSingle();isAdmin=r?.role==='admin'}}
 shell();await({home,login,compte,admin,reset:resetPage}[page]||(()=>{}))();
})();
})();
