// ==========================================
// 1. VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// ==========================================
const MEU_WHATSAPP = "5531987410591";
let todosImoveis = [];
let map;
let markersArray = []; // Guarda os pinos do mapa para podermos limpar depois
let filtroTipoAtual = "";

// Resgata os favoritos salvos no navegador (se não tiver nada, cria um array vazio)
let favoritosIds = JSON.parse(localStorage.getItem('favoritosBuscaTeto')) || [];

document.addEventListener('DOMContentLoaded', async () => {
    // ==========================================
    // 2. CONTROLE DE SEGURANÇA E SESSÃO
    // ==========================================
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    const usuarioNome = sessionStorage.getItem('usuarioNome');

    if (!usuarioNome || tipoUsuario !== 'Cliente') {
        alert("Acesso restrito para Clientes. Faça o login.");
        window.location.href = "login.html";
        return;
    }

    // Saudação personalizada
    document.getElementById('user-greeting').textContent = `Olá, ${usuarioNome}!`;

    // Botão Sair
    document.getElementById('btn-sair-cliente').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = "login.html";
    });

    // ==========================================
    // 3. INICIALIZAÇÃO
    // ==========================================
    inicializarMapa();
    lucide.createIcons(); // Carrega os ícones bonitões (coração, lupa, etc)

    // Busca os imóveis reais do C# (substitui o antigo Mock)
    await carregarImoveis();
});

// ==========================================
// 4. LÓGICA DO MAPA LEAFLET
// ==========================================
function inicializarMapa() {
    map = L.map('map').setView([-19.9167, -43.9345], 12); // Centro de BH
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// ==========================================
// 5. COMUNICAÇÃO COM O C# E PREPARAÇÃO DOS DADOS
// ==========================================
async function carregarImoveis() {
    try {
        const response = await fetch('/imoveis');
        if (response.ok) {
            todosImoveis = await response.json();

            popularFiltroRegiao(todosImoveis);
            renderizarImoveis(todosImoveis, 'property-list'); // Renderiza aba Explorar
            renderizarFavoritos(); // Renderiza aba Favoritos
        } else {
            console.error("Erro ao buscar imóveis do servidor");
            document.getElementById('property-list').innerHTML = "<p>Erro ao carregar os imóveis do servidor.</p>";
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
    }
}

// Pega as cidades/bairros que vieram do banco e joga no <select> automaticamente
function popularFiltroRegiao(lista) {
    const select = document.getElementById('filtro-regiao');
    if (!select) return;

    // Filtra para pegar apenas os nomes de cidades sem repetir
    const regioesUnicas = [...new Set(lista.map(i => i.cidade).filter(c => c))];

    regioesUnicas.forEach(regiao => {
        select.innerHTML += `<option value="${regiao}">${regiao}</option>`;
    });
}

// ==========================================
// 6. RENDERIZAÇÃO DOS CARDS E PINOS NO MAPA
// ==========================================
function renderizarImoveis(lista, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    grid.innerHTML = "";

    // Se estivermos atualizando a tela principal, limpa os pinos velhos do mapa e atualiza o contador
    if (containerId === 'property-list') {
        markersArray.forEach(marker => map.removeLayer(marker));
        markersArray = [];
        document.getElementById('counter').innerText = `${lista.length} imóvel(is) encontrado(s)`;
    }

    if (lista.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-gray);">Nenhum imóvel disponível com esses filtros.</p>`;
        return;
    }

    lista.forEach(imovel => {
        // --- LÓGICA DO MAPA (Apenas na aba principal) ---
        if (containerId === 'property-list') {
            // Se não vier coordenada do C#, criamos uma leve variação em volta de BH para não empilhar os pinos
            const lat = imovel.latitude || (-19.9167 + (Math.random() * 0.05 - 0.025));
            const lng = imovel.longitude || (-43.9345 + (Math.random() * 0.05 - 0.025));

            const marker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`<b>${imovel.titulo}</b><br>R$ ${imovel.preco.toLocaleString('pt-BR')}/mês`);

            // Clicou no pino, rola a página até o card
            marker.on('click', () => {
                const card = document.getElementById(`card-${imovel.id}`);
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            markersArray.push(marker);
        }

        // --- LÓGICA DO CARD E FAVORITOS ---
        // Verifica se o ID deste imóvel está salvo no array de favoritos
        const isFav = favoritosIds.includes(imovel.id) ? 'favoritado' : '';
        const bgImg = imovel.imagem ? `url('${imovel.imagem}')` : 'none';
        const bgColor = imovel.imagem ? 'transparent' : '#CBD5E1';

        const mensagem = encodeURIComponent(`Olá! Vi o anúncio "${imovel.titulo}" no BuscaTeto e tenho interesse em alugar.`);
        const linkWhats = `https://wa.me/${MEU_WHATSAPP}?text=${mensagem}`;

        // Cria o HTML do Card
        const cardHTML = `
            <div class="property-card" id="card-${imovel.id}">
                <div class="property-img" style="background-image: ${bgImg}; background-color: ${bgColor}; background-size: cover; background-position: center;">
                    <span class="status-badge">${imovel.tipo || 'Imóvel'}</span>
                    
                    <button class="btn-fav ${isFav}" onclick="toggleFavorito(${imovel.id})">
                        <i data-lucide="heart" style="width: 20px; height: 20px;"></i>
                    </button>
                </div>
                <div class="property-info">
                    <span class="price">R$ ${imovel.preco.toLocaleString('pt-BR')}/mês</span>
                    <h3 class="title">${imovel.titulo}</h3>
                    <p class="address"><i data-lucide="map-pin" style="width: 16px; height: 16px;"></i> ${imovel.cidade || 'Não informado'}</p>
                    <a href="${linkWhats}" target="_blank" class="btn-whatsapp">
                        Chamar no WhatsApp
                    </a>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });

    // Se tiver imóveis, ajusta a câmera do mapa para englobar todos eles
    if (containerId === 'property-list' && lista.length > 0) {
        const group = new L.featureGroup(markersArray);
        map.fitBounds(group.getBounds().pad(0.1));
    }

    lucide.createIcons(); // Recarrega os ícones para os botões novos
}

// ==========================================
// 7. SISTEMA DE FILTROS CRUZADOS
// ==========================================
window.filtrarTipo = function (tipo) {
    filtroTipoAtual = tipo;

    // Atualiza a cor do botão ativo
    document.querySelectorAll('.chip').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    aplicarFiltrosGlobais();
}

window.filtrarTudo = function () {
    aplicarFiltrosGlobais();
}

function aplicarFiltrosGlobais() {
    const textoBusca = document.getElementById('search-input').value.toLowerCase();
    const regiaoBusca = document.getElementById('filtro-regiao')?.value || "";

    const imoveisFiltrados = todosImoveis.filter(imovel => {
        const matchesTexto = imovel.titulo.toLowerCase().includes(textoBusca) || (imovel.cidade && imovel.cidade.toLowerCase().includes(textoBusca));
        const matchesRegiao = regiaoBusca === "" || imovel.cidade === regiaoBusca;
        const matchesTipo = filtroTipoAtual === "" || imovel.tipo === filtroTipoAtual;

        return matchesTexto && matchesRegiao && matchesTipo;
    });

    renderizarImoveis(imoveisFiltrados, 'property-list');
}

// ==========================================
// 8. SISTEMA DE FAVORITOS E NAVEGAÇÃO DE ABAS
// ==========================================
window.toggleFavorito = function (id) {
    if (favoritosIds.includes(id)) {
        favoritosIds = favoritosIds.filter(favId => favId !== id); // Remove
    } else {
        favoritosIds.push(id); // Adiciona
    }

    // Salva a alteração direto no navegador
    localStorage.setItem('favoritosBuscaTeto', JSON.stringify(favoritosIds));

    // Renderiza tudo de novo para atualizar as cores dos corações
    aplicarFiltrosGlobais();
    renderizarFavoritos();
}

function renderizarFavoritos() {
    const meusFavoritos = todosImoveis.filter(imovel => favoritosIds.includes(imovel.id));
    renderizarImoveis(meusFavoritos, 'favorites-list');
}

// Alterna entre a aba Explorar e a aba Favoritos
window.switchTab = function (tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    // Corrige um bug clássico do Leaflet onde o mapa fica cinza se estava escondido
    if (tabId === 'explorar' && map) {
        setTimeout(() => { map.invalidateSize(); }, 100);
    }
}