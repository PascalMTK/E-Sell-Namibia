const products=[
  {id:1,name:'iPhone 14 Pro 256GB',category:'Phones',price:12500,location:'Windhoek',condition:'Excellent',tag:'Featured',image:'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',description:'A sample listing showing how E-Sell product details will appear.'},
  {id:2,name:'Samsung 55-inch Smart TV',category:'Electronics',price:6800,location:'Windhoek',condition:'Good',tag:'Featured',image:'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',description:'A sample television listing for the E-Sell frontend preview.'},
  {id:3,name:'Toyota Corolla',category:'Cars',price:115000,location:'Swakopmund',condition:'Used',tag:'Popular',image:'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',description:'A sample vehicle listing for browsing the E-Sell interface.'},
  {id:4,name:'MacBook Air M2',category:'Computers',price:14900,location:'Windhoek',condition:'Like New',tag:'New arrival',image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',description:'A sample laptop listing for the E-Sell frontend preview.'},
  {id:5,name:'L-Shaped Sofa',category:'Furniture',price:7500,location:'Walvis Bay',condition:'Good',tag:'Featured',image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',description:'A sample furniture listing for the E-Sell frontend preview.'},
  {id:6,name:'Dining Table Set',category:'Furniture',price:4200,location:'Oshakati',condition:'Used',tag:'New arrival',image:'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',description:'A sample dining set listing for browsing the E-Sell interface.'},
  {id:7,name:'Sony Mirrorless Camera',category:'Electronics',price:9300,location:'Windhoek',condition:'Excellent',tag:'Featured',image:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',description:'A sample camera listing for the E-Sell frontend preview.'},
  {id:8,name:'Modern Lounge Chair',category:'Home & Garden',price:1800,location:'Walvis Bay',condition:'Like New',tag:'New arrival',image:'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',description:'A sample home listing for the E-Sell frontend preview.'}
];
const categories=[['All','✦'],['Electronics','▣'],['Phones','▯'],['Computers','▤'],['Cars','↗'],['Furniture','▰'],['Appliances','◫'],['Fashion','◇'],['Home & Garden','⌂'],['Other','＋']];
const teamPlaceholders=[
  {initials:'CEO',role:'Founder & CEO',bio:'Oversees E-Sell Namibia’s direction and vendor review process.'},
  {initials:'OPS',role:'Operations Lead',bio:'Coordinates listing review, delivery options and customer support.'},
  {initials:'DEV',role:'Product & Technology',bio:'Builds and maintains the E-Sell Namibia marketplace platform.'}
];
const teamGrid=document.getElementById('team-grid');
if(teamGrid){teamGrid.innerHTML=teamPlaceholders.map(t=>`<div class="team-card"><div class="team-avatar">${t.initials}</div><h3>Team member</h3><p class="team-role">${t.role}</p><p class="team-bio">${t.bio}</p><div class="team-social-bar"><a href="#contact">Contact E-Sell <span>↗</span></a></div></div>`).join('');}
const money=n=>'N$'+n.toLocaleString('en-NA');
let active='All',query='';
const grid=document.getElementById('product-grid'),filters=document.getElementById('filters'),categoryGrid=document.getElementById('category-grid');
function selectCategory(category){active=category;render();document.getElementById('shop').scrollIntoView({behavior:'smooth'});}
function render(){
  categoryGrid.innerHTML=categories.map(([name,icon])=>`<button type="button" class="category-card ${active===name?'active':''}" data-category="${name}"><span class="icon" aria-hidden="true">${icon}</span><span>${name==='All'?'All categories':name}</span></button>`).join('');
  filters.innerHTML=categories.map(([name])=>`<button type="button" class="filter ${active===name?'active':''}" data-category="${name}" aria-pressed="${active===name}">${name==='All'?'All products':name}</button>`).join('');
  let shown=products.filter(p=>(active==='All'||p.category===active)&&`${p.name} ${p.category} ${p.location} ${p.condition}`.toLowerCase().includes(query));
  const sort=document.getElementById('sort').value;
  if(sort==='low')shown.sort((a,b)=>a.price-b.price);
  if(sort==='high')shown.sort((a,b)=>b.price-a.price);
  if(sort==='newest')shown.sort((a,b)=>b.id-a.id);
  grid.innerHTML=shown.map(p=>`<article class="product-card"><div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.tag}</span></div><div class="product-body"><span class="product-category">${p.category}</span><h3>${p.name}</h3><strong class="price">${money(p.price)}</strong><div class="product-meta"><span>⌖ ${p.location}</span><span>${p.condition}</span></div><button type="button" data-product="${p.id}">View product <span>↗</span></button></div></article>`).join('');
  document.getElementById('empty-state').hidden=shown.length>0;
}
document.addEventListener('click',e=>{const cat=e.target.closest('[data-category]');if(cat)selectCategory(cat.dataset.category);const product=e.target.closest('[data-product]');if(product)openProduct(Number(product.dataset.product));if(e.target.matches('[data-close]'))e.target.closest('dialog').close();});
document.getElementById('sort').addEventListener('change',render);
document.getElementById('search-form').addEventListener('submit',e=>{e.preventDefault();query=document.getElementById('search-input').value.trim().toLowerCase();render();document.getElementById('shop').scrollIntoView({behavior:'smooth'});});
document.getElementById('search-input').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render();});
document.getElementById('clear-filters').addEventListener('click',()=>{active='All';query='';document.getElementById('search-input').value='';render();});
const productDialog=document.getElementById('product-dialog');
function openProduct(id){const p=products.find(x=>x.id===id);if(!p)return;document.getElementById('product-detail').innerHTML=`<div class="detail-grid"><img src="${p.image}" alt="${p.name}"><div class="detail-copy"><span class="product-category">${p.category} / SAMPLE LISTING</span><h2>${p.name}</h2><strong class="price">${money(p.price)}</strong><p>${p.description}</p><dl><div><dt>Condition</dt><dd>${p.condition}</dd></div><div><dt>Location</dt><dd>${p.location}</dd></div></dl><div class="cta-row"><button class="button button-dark" type="button" disabled title="Connected once E-Sell adds contact details">Contact E-Sell <span>↗</span></button><button class="button button-outline" type="button" disabled title="Connected once E-Sell adds a WhatsApp number">WhatsApp E-Sell <span>↗</span></button></div><p class="cta-note">Enquiries route to E-Sell, not the original owner. Buttons activate once E-Sell connects contact details.</p><button class="button button-outline" type="button" data-close>Continue browsing</button></div></div>`;productDialog.showModal();}
const sellDialog=document.getElementById('sell-dialog');
document.getElementById('open-sell').addEventListener('click',()=>sellDialog.showModal());
document.querySelectorAll('a[href="#sell"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();sellDialog.showModal();}));
document.getElementById('sell-form').addEventListener('submit',e=>{e.preventDefault();const files=[...e.target.elements.photos.files];if(files.length>5||files.some(f=>f.size>5*1024*1024)){document.getElementById('form-message').textContent='Please choose up to 5 images of 5 MB or less each.';return;}document.getElementById('form-message').textContent='This preview cannot save your request yet. Please return when submissions are enabled.';});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
const menu=document.getElementById('menu-toggle'),nav=document.getElementById('main-nav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');});
nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
document.getElementById('year').textContent=new Date().getFullYear();
render();
