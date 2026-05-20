document.addEventListener('DOMContentLoaded', () => {
    // 1. Controle de Segurança do Perfil
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');
    const usuarioNome = sessionStorage.getItem('usuarioNome');

    if (!usuarioNome || tipoUsuario !== 'Cliente') {
        alert("Acesso restrito para Clientes. Faça o login.");
        window.location.href = "login.html";
        return;
    }

    // Altera o texto de boas-vindas
    document.getElementById('user-greeting').textContent = `Olá, ${usuarioNome}!`;

    // Botão Sair
    document.getElementById('btn-sair-cliente').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = "login.html";
    });

    // 2. Banco de Dados Simulado (Mock) de Imóveis
    const listaImoveis = [
        { id: 1, titulo: "Apartamento Vista Mar", tipo: "Apartamento", preco: "2.400", local: "Centro", desc: "2 qtos, Varanda, 65m²", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=500", lat: -19.92, lng: -43.94 },
        { id: 2, titulo: "Casa Confortável", tipo: "Casa", preco: "3.100", local: "Bairro Novo", desc: "3 qtos, Quintal amplo", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=500", lat: -19.93, lng: -43.93 },
        { id: 3, titulo: "Studio Compacto", tipo: "Studio", preco: "1.600", local: "Savassi", desc: "Mobiliado, Cozinha integrada", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=500", lat: -19.94, lng: -43.92 }
    ];

    let filtroTipoAtual = "";
    const searchInput = document.getElementById('search-input');
    const propertyGrid = document.getElementById('property-list');
    const counterText = document.getElementById('counter');

    // 3. Inicialização do Mapa Leaflet
    const map = L.map('map').setView([-19.928, -43.941], 13); // Centralizado em exemplo genérico (BH)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Guardar marcadores ativos para limpar e refazer no filtro
    let markersArray = [];

    // 4. Função para Renderizar os Cards e Marcadores do Mapa
    function renderizarImoveis() {
        // Limpa a tela e os marcadores antigos do mapa
        propertyGrid.innerHTML = "";
        markersArray.forEach(marker => map.removeLayer(marker));
        markersArray = [];

        const termoPesquisa = searchInput.value.toLowerCase();

        // Aplica o filtro combinado (Busca por texto + Chip selecionado)
        const imoveisFiltrados = listaImoveis.filter(imovel => {
            const matchesTexto = imovel.titulo.toLowerCase().includes(termoPesquisa) || imovel.local.toLowerCase().includes(termoPesquisa);
            const matchesTipo = filtroTipoAtual === "" || imovel.tipo === filtroTipoAtual;
            return matchesTexto && matchesTipo;
        });

        // Atualiza contador
        counterText.textContent = `${imoveisFiltrados.length} imóvel(is) encontrado(s)`;

        // Gera os elementos no HTML e Marcadores
        imoveisFiltrados.forEach(imovel => {
            // Cria o Card Visual
            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
                <img src="${imovel.img}" alt="${imovel.titulo}" class="property-img">
                <div class="property-details">
                    <h3>${imovel.titulo}</h3>
                    <p class="property-info-text">📍 ${imovel.local} | 🏠 ${imovel.tipo}</p>
                    <p class="property-info-text">${imovel.desc}</p>
                    <p class="property-price">R$ ${imovel.preco} / mês</p>
                    <a href="https://wa.me/5531987410591" target="_blank" class="btn-contact">Contatar Locador</a>
                </div>
            `;
            propertyGrid.appendChild(card);

            // Cria o Pin correspondente no Mapa
            const marker = L.marker([imovel.lat, imovel.lng]).addTo(map)
                .bindPopup(`<b>${imovel.titulo}</b><br>R$ ${imovel.preco}/mês`);
            markersArray.push(marker);
        });
    }

    // 5. Ouvintes de Evento (Inputs e Chips)
    searchInput.addEventListener('input', renderizarImoveis);

    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            // Alterna classe active nos chips
            chips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');

            // Filtra e renderiza novamente
            filtroTipoAtual = e.target.getAttribute('data-type');
            renderizarImoveis();
        });
    });

    // Primeira renderização ao carregar a página
    renderizarImoveis();
});