// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtmu5yKt5Kz8yxzTCCf5MfC2av1O5zL2Q",
  authDomain: "lojavendas-ae418.firebaseapp.com",
  projectId: "lojavendas-ae418",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const numeroWhatsApp = "+559284977208"; // 🔴 COLOQUE SEU NÚMERO AQUI

let todosProdutos = [];

//////////////////////////////////////////////////////
// CARREGAR PRODUTOS
//////////////////////////////////////////////////////
async function carregarProdutos() {

  const q = query(
    collection(db, "produtos"),
    orderBy("criadoEm", "asc")
  );

  const querySnapshot = await getDocs(q);

  todosProdutos = [];

  querySnapshot.forEach((documento) => {
    todosProdutos.push(documento.data());
  });

  preencherCategorias();
  renderizarProdutos(todosProdutos);
}

//////////////////////////////////////////////////////
// RENDERIZAR
//////////////////////////////////////////////////////
function renderizarProdutos(lista) {

  const produtosDiv = document.getElementById("produtos");
  produtosDiv.innerHTML = "";


setTimeout(() => {
  document.querySelectorAll(".imagem-produto").forEach(imagem => {
    imagem.addEventListener("click", () => {
      imagensAtuais = JSON.parse(imagem.dataset.imagens);
      indiceAtual = parseInt(imagem.dataset.index);
      abrirImagem();
    });
  });
}, 100);




  lista.forEach(produto => {

  let imagensHTML = "";

if (produto.imagens && produto.imagens.length > 0) {
  produto.imagens.forEach((img, index) => {
    imagensHTML += `
      <img 
        src="${img}" 
        alt="${produto.nome}"
        class="imagem-produto"
        data-index="${index}"
        data-imagens='${JSON.stringify(produto.imagens)}'>
    `;
  });
}


produtosDiv.innerHTML += `
  <div class="card">

    <div class="imagens-container">
      ${imagensHTML}
    </div>

    <h3>${produto.nome}</h3>

    <p>${produto.categoria}</p>

    <p>
      ${(produto.descricao || "").replace(/\n/g, "<br>")}
    </p>

    <div class="preco">R$ ${produto.preco}</div>

    <div style="display:flex; gap:10px; margin-top:15px;">

<button onclick="adicionarCarrinho(
  '${produto.nome}', 
  ${produto.preco}, 
  '${produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : ""}',
  this
)"
style="
  flex:1;
  padding:10px;
  background:#3b82f6;
  border:none;
  border-radius:8px;
  color:white;
  font-weight:bold;
  cursor:pointer;">
  Adicionar
</button>


      <a href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
        `Olá, quero comprar 1 unidade do produto: ${produto.nome} - R$ ${produto.preco}`
      )}"
        target="_blank"
        style="
          flex:1;
          padding:10px;
          background:#22c55e;
          border-radius:8px;
          color:white;
          font-weight:bold;
          text-align:center;
          text-decoration:none;">
          Comprar 1
      </a>

    </div>

  </div>
`
  });

}


//////////////////////////////////////////////////////
// PREENCHER CATEGORIAS AUTOMÁTICO
//////////////////////////////////////////////////////
function preencherCategorias() {

  const select = document.getElementById("filtroCategoria");
  const categorias = [...new Set(todosProdutos.map(p => p.categoria))];

  select.innerHTML = `<option value="">Todas categorias</option>`;

  categorias.forEach(cat => {
    select.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

//////////////////////////////////////////////////////
// FILTROS
//////////////////////////////////////////////////////
document.getElementById("pesquisa").addEventListener("input", filtrar);
document.getElementById("filtroCategoria").addEventListener("change", filtrar);

function filtrar() {

  const texto = document.getElementById("pesquisa").value.toLowerCase();
  const categoria = document.getElementById("filtroCategoria").value;

  const filtrados = todosProdutos.filter(produto => {

    const nomeMatch = produto.nome.toLowerCase().includes(texto);
    const categoriaMatch = categoria === "" || produto.categoria === categoria;

    return nomeMatch && categoriaMatch;
  });

  renderizarProdutos(filtrados);
}

carregarProdutos();

let imagensAtuais = [];
let indiceAtual = 0;

function abrirImagem() {
  const modal = document.getElementById("modalImagem");
  const img = document.getElementById("imagemExpandida");

  img.src = imagensAtuais[indiceAtual];
  modal.style.display = "flex";
}

document.getElementById("btnProximo").addEventListener("click", () => {
  indiceAtual++;
  if (indiceAtual >= imagensAtuais.length) {
    indiceAtual = 0;
  }
  abrirImagem();
});

document.getElementById("btnAnterior").addEventListener("click", () => {
  indiceAtual--;
  if (indiceAtual < 0) {
    indiceAtual = imagensAtuais.length - 1;
  }
  abrirImagem();
});

document.getElementById("fecharModal").addEventListener("click", () => {
  document.getElementById("modalImagem").style.display = "none";
});

document.getElementById("modalImagem").addEventListener("click", (e) => {
  if (e.target.id === "modalImagem") {
    document.getElementById("modalImagem").style.display = "none";
  }
});


let carrinho = [];

window.adicionarAoCarrinho = function(produto) {
  carrinho.push(produto);
  atualizarCarrinho();

  // 🔥 Anima carrinho
  const carrinhoIcon = document.querySelector(".carrinho");
  carrinhoIcon.classList.add("animar");

  setTimeout(() => {
    carrinhoIcon.classList.remove("animar");
  }, 400);
};


window.abrirCarrinho = function() {
  document.getElementById("modalCarrinho").style.display = "flex";
};

function atualizarCarrinho() {
  const lista = document.getElementById("itensCarrinho");
  const contador = document.getElementById("contadorCarrinho");

  lista.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {

    const div = document.createElement("div");
    div.classList.add("item-carrinho");

    div.innerHTML = `
      <img src="${item.imagem}" class="img-carrinho">
      
      <div class="info-carrinho">
        <span>${item.nome}</span>
     <span>R$ ${Number(item.preco).toFixed(2)}</span>
      </div>

      <button class="remover" onclick="removerItem(${index})">✕</button>
    `;

    lista.appendChild(div);
    total += Number(item.preco);

  });

  document.getElementById("totalCarrinho").innerText =
    "Total: R$ " + total.toFixed(2);

  contador.innerText = carrinho.length;
  
document.getElementById("totalCarrinho").innerText = "Total: R$ " + total.toFixed(2);
contador.innerText = carrinho.length;
}



window.removerItem = function(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
};

window.finalizarCompra = function() {
  let mensagem = "Olá, quero finalizar a compra:%0A";
  let total = 0;

  carrinho.forEach(item => {
    mensagem += `- ${item.nome} (R$ ${item.preco})%0A`;
    total += item.preco;
  });

  mensagem += `%0ATotal: R$ ${total.toFixed(2)}`;

  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, "_blank");
};

window.fecharCarrinho = function() {
  document.getElementById("modalCarrinho").style.display = "none";
};

window.adicionarCarrinho = function(nome, preco, imagem, botao) {

  carrinho.push({
    nome,
    preco,
    imagem
  });

  atualizarCarrinho();

  animarProdutoAteCarrinho(botao);
};

function animarProdutoAteCarrinho(botao) {

  const card = botao.closest(".card");
  const img = card.querySelector(".imagem-produto");
  const carrinhoIcon = document.querySelector(".carrinho");

  if (!img) return;

  const clone = img.cloneNode(true);

  const rect = img.getBoundingClientRect();
  const carrinhoRect = carrinhoIcon.getBoundingClientRect();

  clone.style.position = "fixed";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.style.transition = "all 0.8s cubic-bezier(.65,-0.3,.32,1.4)";
  clone.style.zIndex = "9999";
  clone.style.borderRadius = "10px";

  document.body.appendChild(clone);

  setTimeout(() => {
    clone.style.left = carrinhoRect.left + "px";
    clone.style.top = carrinhoRect.top + "px";
    clone.style.width = "20px";
    clone.style.height = "20px";
    clone.style.opacity = "0";
  }, 10);

  setTimeout(() => {
    clone.remove();
    carrinhoIcon.classList.add("animar");

    setTimeout(() => {
      carrinhoIcon.classList.remove("animar");
    }, 400);

  }, 800);
}


