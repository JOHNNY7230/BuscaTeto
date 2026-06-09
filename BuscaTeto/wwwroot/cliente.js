// ==========================================
// 1. VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// ==========================================
let todosImoveisCliente = [];
let map;
let markersArray = [];
let filtroTipoAtual = "";

// Resgata os favoritos salvos no navegador (se não tiver nada, cria um array vazio)
let favoritosIds = JSON.parse(localStorage.getItem('favoritosBuscaTeto')) || [];

// ==========================================
// 2. EVENTOS QUANDO A PÁGINA CARREGA
// ==========================================
window.addEventListener('load', async () => {

    carregarMeuImovelAlugado();

    verificarNotificacoes();

    // Simula o carregamento do Perfil do Cliente
    carregarPerfilCliente();

    // Inicializa o Mapa
    inicializarMapa();

    // Busca os imóveis da API
    await carregarImoveisCliente();
});

// ==========================================
// 3. LÓGICA DO MAPA LEAFLET
// ==========================================
function inicializarMapa() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    map = L.map('map').setView([-19.9167, -43.9345], 12); // Centro de BH
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// ==========================================
// 4. COMUNICAÇÃO COM O C# E PREPARAÇÃO DOS DADOS
// ==========================================
async function carregarImoveisCliente() {
    try {
        const response = await fetch('/imoveis');
        const data = await response.json();

        // Filtra para mostrar APENAS os imóveis que NÃO estão alugados
        todosImoveisCliente = data.filter(imovel => {
            const status = imovel.statusImovel || imovel.StatusImovel;
            return status !== 'Alugado';
        });

        popularFiltroRegiao(todosImoveisCliente);
        aplicarFiltrosGlobais(); // Já renderiza a vitrine principal
        renderizarFavoritos();

    } catch (error) {
        console.error("Erro ao carregar os imóveis:", error);
        document.getElementById('property-list').innerHTML = '<p style="color: #ef4444;">Erro de conexão com o servidor. O C# está rodando?</p>';
    }
}

function popularFiltroRegiao(lista) {
    const select = document.getElementById('filtro-regiao');
    if (!select) return;

    // Remove as opções de teste e mantém só a "Todas as regiões"
    select.innerHTML = '<option value="">Todas as regiões</option>';

    // Filtra para pegar apenas os nomes de cidades sem repetir
    const regioesUnicas = [...new Set(lista.map(i => i.cidade || i.Cidade).filter(c => c))];

    regioesUnicas.forEach(regiao => {
        select.innerHTML += `<option value="${regiao}">${regiao}</option>`;
    });
}

// ==========================================
// 5. SISTEMA DE FILTROS CRUZADOS
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
    const regiaoBusca = document.getElementById('filtro-regiao').value;

    const imoveisFiltrados = todosImoveisCliente.filter(imovel => {
        const titulo = (imovel.titulo || imovel.Titulo || "").toLowerCase();
        const cidade = imovel.cidade || imovel.Cidade || "Não informado";
        const tipo = imovel.tipo || imovel.Tipo || "";

        const matchesTexto = titulo.includes(textoBusca) || cidade.toLowerCase().includes(textoBusca);
        const matchesRegiao = regiaoBusca === "" || cidade === regiaoBusca;
        const matchesTipo = filtroTipoAtual === "" || tipo === filtroTipoAtual;

        return matchesTexto && matchesRegiao && matchesTipo;
    });

    renderizarVitrine(imoveisFiltrados, 'property-list');
}

// ==========================================
// 6. RENDERIZAÇÃO DOS CARDS E PINOS NO MAPA
// ==========================================
function renderizarVitrine(lista, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    grid.innerHTML = "";

    // Se estivermos atualizando a aba Explorar (vitrine principal), atualiza mapa e contador
    if (containerId === 'property-list') {
        if (map) {
            markersArray.forEach(marker => map.removeLayer(marker));
            markersArray = [];
        }
        document.getElementById('counter').innerText = `${lista.length} imóveis encontrados`;
    }

    if (lista.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-light); padding: 20px;">Nenhum imóvel disponível para esses filtros.</p>';
        return;
    }

    lista.forEach(imovel => {
        const idOriginal = imovel.id || imovel.Id;
        const titulo = imovel.titulo || imovel.Titulo || "Sem título";
        const cidade = imovel.cidade || imovel.Cidade || "Não informado";
        const preco = imovel.preco || imovel.Preco || 0;
        const tipo = imovel.tipo || imovel.Tipo || "Imóvel";
        const imagem = imovel.imagem || imovel.Imagem || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
        const tipoIcone = tipo === 'Apartamento' ? 'fa-building' : 'fa-house';

        // --- LÓGICA DO MAPA ---
        if (containerId === 'property-list' && map) {
            const lat = imovel.latitude || imovel.Latitude || (-19.9167 + (Math.random() * 0.05 - 0.025));
            const lng = imovel.longitude || imovel.Longitude || (-43.9345 + (Math.random() * 0.05 - 0.025));

            const marker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`<b>${titulo}</b><br>R$ ${preco.toLocaleString('pt-BR')}/mês`);

            marker.on('click', () => {
                const card = document.getElementById(`card-${idOriginal}`);
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            markersArray.push(marker);
        }

        // --- LÓGICA DE FAVORITOS ---
        const isFav = favoritosIds.includes(idOriginal);
        const corCoracao = isFav ? 'color: var(--danger);' : 'color: var(--text-light);';
        const classeFav = isFav ? 'favoritado' : '';

        // Cria o Card Html - COM O CLIQUE NA IMAGEM
        grid.innerHTML += `
            <div class="property-card" id="card-${idOriginal}">
                <div class="property-img clickable-img" onclick="abrirDetalhesCliente(${idOriginal})" title="Clique para ver detalhes">
                    <img src="${imagem}" alt="${titulo}">
                    <span class="status-badge badge-vago">Disponível</span>
                </div>
                <div class="property-info">
                    <div class="type-badge"><i class="fa-solid ${tipoIcone}"></i> ${tipo}</div>
                    <h3>${titulo}</h3>
                    <p class="address"><i class="fa-solid fa-location-dot"></i> ${cidade}</p>
                    <div class="price-row">
                        <span class="price">R$ ${preco.toFixed(2)}<span>/mês</span></span>
                        <button class="btn-icon-fav ${classeFav}" onclick="toggleFavorito(${idOriginal}, this)" style="${corCoracao}">
                            <i class="fa-solid fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    // Ajusta a câmera do mapa para englobar todos os imóveis (se houverem)
    if (containerId === 'property-list' && lista.length > 0 && map && markersArray.length > 0) {
        const group = new L.featureGroup(markersArray);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// ==========================================
// 7. SISTEMA DE FAVORITOS (LocalStorage)
// ==========================================
window.toggleFavorito = function (id, btnElement) {
    if (favoritosIds.includes(id)) {
        favoritosIds = favoritosIds.filter(favId => favId !== id); // Remove
        if (btnElement) {
            btnElement.style.color = 'var(--text-light)';
            btnElement.classList.remove('favoritado');
        }
    } else {
        favoritosIds.push(id); // Adiciona
        if (btnElement) {
            btnElement.style.color = 'var(--danger)';
            btnElement.classList.add('favoritado');
        }
    }

    localStorage.setItem('favoritosBuscaTeto', JSON.stringify(favoritosIds));

    // Atualiza a aba de Favoritos no fundo
    renderizarFavoritos();
}

function renderizarFavoritos() {
    const favGrid = document.getElementById('favorites-list');
    if (!favGrid) return;
    favGrid.innerHTML = '';

    const meusFavoritos = todosImoveisCliente.filter(imovel => favoritosIds.includes(imovel.id || imovel.Id));

    if (meusFavoritos.length === 0) {
        favGrid.innerHTML = '<p style="color: var(--text-light); padding: 20px;">Você ainda não tem nenhum imóvel favorito. Comece a explorar!</p>';
        return;
    }

    // Aproveitamos a mesma função de renderização para a aba de favoritos!
    renderizarVitrine(meusFavoritos, 'favorites-list');
}

// ==========================================
// 8. FUNÇÃO: ABRIR DETALHES DO IMÓVEL NO MODAL
// ==========================================
window.abrirDetalhesCliente = function (id) {
    const imovel = todosImoveisCliente.find(i => (i.id == id || i.Id == id));
    if (!imovel) return;

    const titulo = imovel.titulo || imovel.Titulo || "Sem título";
    const preco = imovel.preco || imovel.Preco || 0;

    document.getElementById('detalhe-imagem').src = imovel.imagem || imovel.Imagem || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';
    document.getElementById('detalhe-titulo').innerText = titulo;
    document.getElementById('detalhe-preco-tag').innerText = `R$ ${preco.toFixed(2)}`;
    document.getElementById('detalhe-descricao').innerText = imovel.descricao || imovel.Descricao || "Casa com excelente iluminação natural, ambientes amplos e bem ventilados. Ótima localização próxima a comércios.";
    document.getElementById('detalhe-endereco').innerText = `${imovel.logradouro || imovel.Logradouro || 'Rua não informada'}, ${imovel.numero || imovel.Numero || 'S/N'} - ${imovel.bairro || imovel.Bairro || 'Bairro não informado'}`;
    document.getElementById('detalhe-cep').innerText = imovel.cep || imovel.Cep || "00000-000";
    document.getElementById('detalhe-quartos').innerText = `${imovel.quartos || imovel.Quartos || 3} Quarto(s)`;
    document.getElementById('detalhe-area').innerText = imovel.area || imovel.Area ? `${imovel.area || imovel.Area} m²` : '120 m²';

    // Gera o link do WhatsApp
    const mensagemWhats = encodeURIComponent(`Olá! Vi o imóvel "${titulo}" no BuscaTeto e tenho interesse em alugar.`);
    document.getElementById('detalhe-whatsapp').href = `https://wa.me/5531987410591?text=${mensagemWhats}`;

    document.getElementById('modal-detalhes').style.display = 'flex';
}

window.closeModal = function (modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ==========================================
// 9. CARREGAR DADOS DO PERFIL (Nav/Dropdown)
// ==========================================
function carregarPerfilCliente() {
    const nome = sessionStorage.getItem('usuarioNome') || "João Cliente";
    const email = sessionStorage.getItem('usuarioEmail') || "cliente@buscateto.com";
    const id = sessionStorage.getItem('usuarioId') || "99";

    const elNomeDrop = document.getElementById('perfil-nome-dropdown');
    if (elNomeDrop) elNomeDrop.innerText = nome;

    const elEmailDrop = document.getElementById('perfil-email-dropdown');
    if (elEmailDrop) elEmailDrop.innerText = email;
}
// ==========================================
// 10. SISTEMA "MEU IMÓVEL" E PAGAMENTOS (Mágica da Apresentação)
// ==========================================
function carregarMeuImovelAlugado() {
    const usuarioIdLogado = sessionStorage.getItem('usuarioId') || "45"; // ID de teste do inquilino
    const container = document.getElementById('meu-imovel-container');

    // Busca na API o imóvel que está alugado para ESSE cliente
    // Como a API original não foi filtrada por inquilino, faremos isso no front
    fetch('/imoveis')
        .then(res => res.json())
        .then(data => {
            const meuImovel = data.find(i => (i.inquilinoId == usuarioIdLogado || i.InquilinoId == usuarioIdLogado) && (i.statusImovel === 'Alugado' || i.StatusImovel === 'Alugado'));

            if (!meuImovel) {
                container.innerHTML = `<div style="background: white; padding: 32px; border-radius: 16px; text-align: center; border: 1px solid var(--border);">
                    <i class="fa-solid fa-house-crack" style="font-size: 3rem; color: var(--border); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--text-main);">Você ainda não alugou nenhum imóvel</h3>
                    <p style="color: var(--text-light);">Explore o mapa e encontre o seu novo lar no BuscaTeto!</p>
                </div>`;
                return;
            }

            // Verifica no localStorage se já foi pago hoje
            const statusPagamento = localStorage.getItem('pagamento_' + (meuImovel.id || meuImovel.Id)) || "Pendente";
            const btnPago = statusPagamento === "Pago"
                ? `<button class="btn-primary" style="background: var(--success); cursor: default;"><i class="fa-solid fa-check-double"></i> Mensalidade Paga</button>`
                : `<button class="btn-primary" onclick="pagarMensalidade(${meuImovel.id || meuImovel.Id})"><i class="fa-solid fa-barcode"></i> Pagar R$ ${(meuImovel.preco || meuImovel.Preco).toFixed(2)}</button>`;

            container.innerHTML = `
                <div style="background: white; padding: 24px; border-radius: 16px; border: 1px solid var(--border); display: flex; gap: 24px; box-shadow: var(--shadow-sm);">
                    <img src="${meuImovel.imagem || meuImovel.Imagem}" style="width: 250px; height: 180px; object-fit: cover; border-radius: 12px;">
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                        <h3 style="font-size: 1.4rem; color: var(--dark); margin-bottom: 8px;">${meuImovel.titulo || meuImovel.Titulo}</h3>
                        <p style="color: var(--text-light); margin-bottom: 16px;"><i class="fa-solid fa-location-dot"></i> ${meuImovel.cidade || meuImovel.Cidade}</p>
                        
                        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px dashed var(--border); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 0.85rem; color: var(--text-light); font-weight: 600;">Vencimento</span>
                                <p style="font-size: 1.1rem; color: var(--dark); font-weight: 800;">Todo dia ${meuImovel.diaVencimento || meuImovel.DiaVencimento || 10}</p>
                            </div>
                            <div>
                                <span style="font-size: 0.85rem; color: var(--text-light); font-weight: 600;">Status</span><br>
                                <span class="tag ${statusPagamento === 'Pago' ? 'tag-pago' : 'tag-pendente'}" style="background: ${statusPagamento === 'Pago' ? '#d1fae5' : '#fef3c7'}; color: ${statusPagamento === 'Pago' ? '#059669' : '#d97706'}; padding: 4px 10px; border-radius: 12px; font-weight:bold;">${statusPagamento}</span>
                            </div>
                        </div>
                        <div style="align-self: flex-end;">${btnPago}</div>
                    </div>
                </div>
            `;
        });
}

window.pagarMensalidade = function (idImovel) {
    // Salva na memória do navegador que este imóvel foi pago!
    localStorage.setItem('pagamento_' + idImovel, 'Pago');
    alert("💸 Pagamento aprovado! O anunciante já foi notificado.");

    // Limpa a notificação de cobrança (se houver)
    const usuarioIdLogado = sessionStorage.getItem('usuarioId') || "45";
    localStorage.removeItem('notificacao_' + usuarioIdLogado);

    carregarMeuImovelAlugado();
    verificarNotificacoes();
}

function verificarNotificacoes() {
    const usuarioIdLogado = sessionStorage.getItem('usuarioId') || "45";
    const aviso = localStorage.getItem('notificacao_' + usuarioIdLogado);

    const badge = document.getElementById('badge-notificacao');
    const lista = document.getElementById('lista-notificacoes');

    if (aviso) {
        badge.style.display = 'block';
        lista.innerHTML = `<div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px;">
            <strong>Aviso de Cobrança:</strong><br>${aviso}
        </div>`;
    } else {
        badge.style.display = 'none';
        lista.innerHTML = 'Nenhuma notificação no momento.';
    }
}