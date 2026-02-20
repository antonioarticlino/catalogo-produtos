let imagensAtuais = [];
let indiceAtual = 0;
let carrinho = [];
let todosProdutos = [];

function abrirImagem() {
  const modal = document.getElementById("modalImagem");
  const img = document.getElementById("imagemExpandida");

  if (!imagensAtuais.length) return;

  img.src = imagensAtuais[indiceAtual];
  modal.style.display = "flex";
}


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

  renderizarProdutos(todosProdutos);
}
//////////////////////////////////////////////////////
// RENDERIZAR PRODUTOS POR CATEGORIA
//////////////////////////////////////////////////////
function renderizarProdutos(lista) {

  const produtosDiv = document.getElementById("produtos");
  produtosDiv.innerHTML = "";

  // Agrupar produtos por categoria
  const categorias = [...new Set(lista.map(p => p.categoria))];

  categorias.forEach(cat => {
    const catSection = document.createElement("div");
    catSection.classList.add("categoria-produtos");
    catSection.innerHTML = `<h2 style="margin-top:40px; color:#3b82f6;">${cat}</h2>`;

const catGrid = document.createElement("div");
catGrid.classList.add("grid-produtos");
    lista.filter(p => p.categoria === cat).forEach(produto => {
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

      const precoOriginal = Number(produto.preco);
      const precoFinal = calcularPreco(produto);
      const temPromocao = produto.promocao && produto.promocao.ativo && precoFinal < precoOriginal;

      // Botão Adicionar
      const botaoAdicionar = produto.vendido
        ? `<button disabled style="flex:1;padding:10px;background:#888;border:none;border-radius:8px;color:white;font-weight:bold;cursor:not-allowed;">
             VENDIDO
           </button>`
        : `<button onclick="adicionarCarrinho('${produto.nome}', ${precoFinal}, '${produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : ""}', this)"
             style="flex:1;padding:10px;background:#3b82f6;border:none;border-radius:8px;color:white;font-weight:bold;cursor:pointer;">
             Adicionar
           </button>`;

      // Botão WhatsApp
      const botaoWhatsApp = produto.vendido
        ? `<button disabled style="flex:1;padding:10px;background:#888;border:none;border-radius:8px;color:white;font-weight:bold;cursor:not-allowed;">
             Produto vendido
           </button>`
        : `<a href="https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(`Olá, quero comprar 1 unidade do produto: ${produto.nome} - R$ ${precoFinal}`)}"
             target="_blank"
             style="flex:1;padding:10px;background:#22c55e;border-radius:8px;color:white;font-weight:bold;text-align:center;text-decoration:none;">
             Comprar 1
           </a>`;

  const card = document.createElement("div");
card.classList.add("card");

card.innerHTML = `
  <div class="imagens-container">
    ${imagensHTML}
  </div>

  <h3 class="titulo-produto">${produto.nome}</h3>

<p class="descricao-produto">
  ${(produto.descricao || "").replace(/\n/g, "<br>")}
</p>

  <div class="area-preco">
    ${temPromocao
      ? `
        <span class="preco-antigo">R$ ${precoOriginal.toFixed(2)}</span>
        <span class="preco-novo">R$ ${precoFinal.toFixed(2)}</span>
        <span class="badge-desconto">
          -${produto.promocao.desconto}%
        </span>
        <p class="contador-promocao" data-fim="${produto.promocao.dataFim}"></p>
      `
      : `<span class="preco-novo">R$ ${precoOriginal.toFixed(2)}</span>`
    }
  </div>

  <div class="botoes-card">
    ${botaoAdicionar}
    ${botaoWhatsApp}
  </div>
`;
      catGrid.appendChild(card);
    });

    catSection.appendChild(catGrid);
    produtosDiv.appendChild(catSection);
  });

  // Reaplicar evento de clique nas imagens
  setTimeout(() => {
    document.querySelectorAll(".imagem-produto").forEach(imagem => {
      imagem.addEventListener("click", () => {
        imagensAtuais = JSON.parse(imagem.dataset.imagens);
        indiceAtual = parseInt(imagem.dataset.index);
        abrirImagem();
      });
    });
  }, 100);
}




// 🔥 FUNÇÃO DE CONTADOR – FICA FORA DO RENDERIZAR
function atualizarContadores() {
  const contadores = document.querySelectorAll(".contador-promocao");

  contadores.forEach(c => {
    const fim = new Date(c.dataset.fim);
    const agora = new Date();
    let diff = fim - agora;

    if (diff <= 0) {
      c.innerText = "Oferta encerrada";
      return;
    }

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= dias * (1000 * 60 * 60 * 24);

    const horas = Math.floor(diff / (1000 * 60 * 60));
    diff -= horas * (1000 * 60 * 60);

    const minutos = Math.floor(diff / (1000 * 60));
    diff -= minutos * (1000 * 60);

    const segundos = Math.floor(diff / 1000);

    c.innerText = `Oferta termina em ${dias}d ${horas}h ${minutos}m ${segundos}s`;
  });
}

// 🔥 Chama a cada 1 segundo
setInterval(atualizarContadores, 1000);

document.addEventListener("DOMContentLoaded", () => {

  //////////////////////////////////////////////////////
  // FILTRO POR TEXTO (BUSCA)
  //////////////////////////////////////////////////////

  const pesquisa = document.getElementById("pesquisa");

  if (pesquisa) {
    pesquisa.addEventListener("input", filtrarPorTexto);
  }

  function filtrarPorTexto() {
    const texto = pesquisa.value.toLowerCase();

    const filtrados = todosProdutos.filter(produto =>
      produto.nome.toLowerCase().includes(texto)
    );

    renderizarProdutos(filtrados);
  }

  carregarProdutos();

  //////////////////////////////////////////////////////
  // MODAL CONTROLES
  //////////////////////////////////////////////////////

  const btnProximo = document.getElementById("btnProximo");
  const btnAnterior = document.getElementById("btnAnterior");
  const fecharModal = document.getElementById("fecharModal");
  const modalImagem = document.getElementById("modalImagem");

  if (btnProximo) {
    btnProximo.addEventListener("click", () => {
      indiceAtual++;
      if (indiceAtual >= imagensAtuais.length) {
        indiceAtual = 0;
      }
      abrirImagem();
    });
  }

  if (btnAnterior) {
    btnAnterior.addEventListener("click", () => {
      indiceAtual--;
      if (indiceAtual < 0) {
        indiceAtual = imagensAtuais.length - 1;
      }
      abrirImagem();
    });
  }

  if (fecharModal) {
    fecharModal.addEventListener("click", () => {
      modalImagem.style.display = "none";



    });
  }

  if (modalImagem) {
    modalImagem.addEventListener("click", (e) => {
      if (e.target.id === "modalImagem") {
        modalImagem.style.display = "none";
      }
    });
  }

});
window.adicionarAoCarrinho = function(produto) {
  carrinho.push(produto);
  atualizarCarrinho();

  // 🔥 Anima carrinho (somente se existir)
  const carrinhoIcon = document.querySelector(".carrinho");

  if (carrinhoIcon) {
    carrinhoIcon.classList.add("animar");

    setTimeout(() => {
      carrinhoIcon.classList.remove("animar");
    }, 400);
  }
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

function calcularPreco(produto) {

  const preco = Number(produto.preco); // garante que seja número

  if (!produto.promocao || !produto.promocao.ativo) return preco;

  const agora = new Date();

  if (!produto.promocao.dataInicio || !produto.promocao.dataFim) return preco;

  const inicio = new Date(produto.promocao.dataInicio);
  const fim = new Date(produto.promocao.dataFim);

  if (agora >= inicio && agora <= fim) {
    return preco - (preco * produto.promocao.desconto / 100);
  }

  return preco;
}
window.filtrarPromocoes = function() {
  const promocaoProdutos = todosProdutos.filter(produto => {
    const precoOriginal = Number(produto.preco);
    const precoFinal = calcularPreco(produto);
    return produto.promocao && produto.promocao.ativo && precoFinal < precoOriginal;
  });

  renderizarProdutos(promocaoProdutos);
};
// FUNÇÃO PARA VOLTAR AO INÍCIO
window.voltarInicio = function() {
  renderizarProdutos(todosProdutos); // mostra todos os produtos
};
window.filtrarCategoria = function(categoria) {

  if (categoria === "Todas") {
    renderizarProdutos(todosProdutos);
  } else {
    const filtrados = todosProdutos.filter(produto =>
      produto.categoria === categoria
    );

    renderizarProdutos(filtrados);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};
