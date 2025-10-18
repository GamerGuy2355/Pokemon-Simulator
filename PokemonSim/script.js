let money = parseFloat(localStorage.getItem("money")) || 1000;

const pokemonImages = [
  "snorlax.jpg","charizard.jpg","pikachu.jpg","mewtwo.jpg","gengar.jpg",
  "eevee.jpg","bulbasaur.jpg","squirtle.jpg","charmander.jpg","lapras.jpg"
];

function buyPack(packName, cost) {
  if (money < cost) { alert("Not enough money!"); return; }
  money -= cost; saveData(); updateMoney();
  startPackAnimation(packName);
}

function startPackAnimation(packName) {
  const packDiv = document.getElementById("packOpening");
  const packImage = document.getElementById("packImage");
  const packText  = document.getElementById("packText");

  if(packName==="Base Set") packImage.src="images/baseset.jpg";
  else if(packName==="Evolving Skies") packImage.src="images/evolvingskies.jpg";
  else packImage.src="images/scarletviolet.jpg";

  packDiv.style.display="flex"; packText.textContent="Opening pack...";
  setTimeout(()=>{ packDiv.style.display="none"; openPack(packName); }, 2000);
}

function openPack(packName){
  const results=document.getElementById("results");
  results.innerHTML=`<h3>Opened ${packName} Pack</h3>`;
  const cards=document.createElement("div");
  cards.className="cards-container"; results.appendChild(cards);

  const roll=Math.random(); let packType="normal";
  if(roll<0.03) packType="god"; else if(roll<0.1) packType="demigod";

  if(packType==="god") showPackBanner("GOD PACK ⚡","#ffd700","god");
  else if(packType==="demigod") showPackBanner("DEMI-GOD PACK 🔥","#ff5a2f","demigod");

  let rarities;
  if(packType==="god"){
    rarities=[
      {name:"Ultra Rare",chance:0.5,value:r(250,600)},
      {name:"Secret Rare ✨",chance:0.5,value:r(600,1500)}
    ];
  } else if(packType==="demigod"){
    rarities=[
      {name:"Rare",chance:0.5,value:r(50,150)},
      {name:"Ultra Rare",chance:0.3,value:r(150,400)},
      {name:"Secret Rare ✨",chance:0.2,value:r(400,900)}
    ];
  } else {
    rarities=[
      {name:"Common",chance:0.6,value:r(2,10)},
      {name:"Uncommon",chance:0.25,value:r(10,30)},
      {name:"Rare",chance:0.1,value:r(30,100)},
      {name:"Ultra Rare",chance:0.04,value:r(100,300)},
      {name:"Secret Rare ✨",chance:0.01,value:r(300,1000)}
    ];
  }

  const variants=[
    {name:"EX",chance:0.08,class:"variant-ex",multi:[1.2,1.4]},
    {name:"Full Art",chance:0.05,class:"variant-fullart",multi:[1.3,1.6]},
    {name:"Rainbow",chance:0.02,class:"variant-rainbow",multi:[1.5,1.9]},
    {name:"Gold",chance:0.01,class:"variant-gold",multi:[1.8,2.4]}
  ];

  function maybeVariant(){for(const v of variants){if(Math.random()<v.chance)return v;}return null;}

  let packValue=0;
  for(let i=0;i<10;i++){
    const rarity=pick(rarities);
    const variant=maybeVariant();
    let value=rarity.value;
    if(variant){const [lo,hi]=variant.multi; value=Math.round(value*(Math.random()*(hi-lo)+lo));}
    const img=pokemonImages[Math.floor(Math.random()*pokemonImages.length)];
    const card=createCard(rarity.name,value,img,variant?.name,variant?.class);
    cards.appendChild(card);

    card.onclick=function(){
      if(card.classList.contains("revealed"))return;
      card.classList.add("revealed");
      packValue+=value;

      // save card
      saveCard(img,rarity.name,value,variant?.name);

      if(document.querySelectorAll(".card.revealed").length===10){
        setTimeout(()=>{
          money+=packValue; saveData(); updateMoney(); showPopup(`+$${packValue.toFixed(2)}`);
          const tv=document.createElement("div");
          tv.className="totalValue";
          tv.innerHTML=`<strong>Total Pack Value:</strong> $${packValue.toFixed(2)} <br> (${packType.toUpperCase()} Pack)`;
          results.appendChild(tv);
        },400);
      }
    };
  }
}

function createCard(rarity,val,img,varName,varClass){
  const c=document.createElement("div"); c.className="card";
  if(varClass)c.classList.add(varClass);
  const inner=document.createElement("div"); inner.className="card-inner";
  const front=document.createElement("div"); front.className="card-front"; front.textContent="Reveal Card";
  const back=document.createElement("div"); back.className="card-back"; back.style.backgroundImage=`url('images/${img}')`;
  const txt=document.createElement("p");
  const vtag=varName?` • <b>${varName}</b>`:"";
  txt.innerHTML=`${rarity}${vtag} • $${val}`; txt.className="price-text";
  back.appendChild(txt); inner.append(front,back); c.appendChild(inner);
  return c;
}

/******** Helpers ********/
function pick(r){let x=Math.random(),a=0;for(const i of r){a+=i.chance;if(x<a)return i;}return r[0];}
function r(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function updateMoney(){const m=document.getElementById("money");if(m)m.textContent=`$${money.toFixed(2)}`;}
function showPopup(t){const p=document.createElement("div");p.className="value-popup";p.textContent=t;document.body.appendChild(p);const rect=document.querySelector(".money-counter").getBoundingClientRect();p.style.left=rect.left+rect.width/2-40+"px";p.style.top=rect.top-20+"px";setTimeout(()=>p.remove(),1500);}
function showPackBanner(t,c,tp){const b=document.createElement("div");b.className="pack-banner";b.style.color=c;b.style.borderColor=c;if(tp==="god")b.classList.add("god-glow");else if(tp==="demigod")b.classList.add("demigod-glow");b.textContent=t;document.body.appendChild(b);setTimeout(()=>{b.style.opacity="0";setTimeout(()=>b.remove(),900);},2000);}

/******** Data Saving ********/
function saveData(){localStorage.setItem("money",money);}
function saveCard(img,rarity,value,variant){
  const col=JSON.parse(localStorage.getItem("collection")||"[]");
  col.push({image:img,rarity,value,variant:variant||""});
  localStorage.setItem("collection",JSON.stringify(col));
}
function loadCollection(){
  const cont=document.getElementById("collectionContainer");
  if(!cont)return;
  const col=JSON.parse(localStorage.getItem("collection")||"[]");
  cont.innerHTML="";
  if(col.length===0){cont.innerHTML="<p>No cards yet — go rip some packs!</p>";return;}
  for(const c of col){
    const d=document.createElement("div");
    d.className="collected-card"; d.style.backgroundImage=`url('images/${c.image}')`;
    d.innerHTML=`<p>${c.rarity}${c.variant?(" • "+c.variant):""} • $${c.value}</p>`;
    cont.appendChild(d);
  }
}
function resetProgress(){
  if(confirm("Reset all progress?")){
    localStorage.clear(); money=1000; updateMoney(); loadCollection();
  }
}
window.addEventListener("load",()=>{updateMoney();});
