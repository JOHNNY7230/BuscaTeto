// ==========================================
// 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================
const MEU_WHATSAPP = "5531987410591";
let imoveis = [];
let map;
let markersGroup;

window.onload = async () => {
    initMap();
    await carregarImoveisDoBanco();
};

function initMap() {
    map = L.map('map').setView([-19.9167, -43.9345], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    markersGroup = L.layerGroup().addTo(map);
}

// ==========================================
// 2. COMUNICAÇÃO COM O BACKEND (C#)
// ==========================================

async function carregarImoveisDoBanco() {
    try {
        const response = await fetch('/imoveis');
        if (response.ok) {
            imoveis = await response.json();
            renderizar(imoveis);
        } else {
            console.error("Erro ao buscar imóveis do servidor");
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
    }
}

// ==========================================
// 3. RENDERIZAÇÃO NA TELA E NO MAPA
// ==========================================

function renderizar(lista) {
    const grid = document.getElementById('property-list');
    const contador = document.getElementById('counter');
    if (!grid) return;

    grid.innerHTML = "";
    markersGroup.clearLayers();

    lista.forEach(item => {
        // --- LÓGICA DO MAPA ---
        const lat = item.latitude || (-19.9167 + (Math.random() * 0.05));
        const lng = item.longitude || (-43.9345 + (Math.random() * 0.05));

        const marker = L.marker([lat, lng])
            .addTo(markersGroup)
            .bindPopup(`<b>${item.titulo}</b><br>R$ ${item.preco.toLocaleString('pt-BR')}`);

        // NOVA FUNÇÃO: Ao clicar no marcador, rola a página até o card do imóvel
        marker.on('click', () => {
            const cardElement = document.getElementById(`imovel-${item.id}`);
            if (cardElement) cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        // --- LÓGICA DO CARD ---
        const mensagem = encodeURIComponent(`Olá! Vi o anúncio "${item.titulo}" no BuscaTeto.`);
        const linkWhats = `https://wa.me/${MEU_WHATSAPP}?text=${mensagem}`;

        grid.innerHTML += `
            <div class="card" id="imovel-${item.id}">
                <div class="card-img" style="background-image: url('${item.imagem}'); background-size: cover; background-position: center;"></div>
                <div class="card-content">
                    <div class="card-price">R$ ${item.preco.toLocaleString('pt-BR')}</div>
                    <h3 class="card-title">${item.titulo}</h3>
                    <p style="color: #2563eb; font-weight: 600; font-size: 0.85rem; margin-bottom: 5px;">📍 ${item.cidade}</p>
                    <p class="card-info">Tipo: ${item.tipo || 'Imóvel'} • Quartos: ${item.quartos}</p>
                    <p class="card-desc">${item.descricao || ''}</p>
                    <a href="${linkWhats}" target="_blank" class="btn-whatsapp" style="display: block; text-align: center; background: #25D366; color: white; text-decoration: none; padding: 12px; border-radius: 10px; margin-top: 15px; font-weight: bold;">
                        Tenho Interesse
                    </a>
                </div>
            </div>
        `;
    });

    // NOVA FUNÇÃO: Ajusta o zoom do mapa automaticamente para mostrar os imóveis filtrados
    if (lista.length > 0) {
        const group = new L.featureGroup(markersGroup.getLayers());
        map.fitBounds(group.getBounds().pad(0.1));
    }

    if (contador) contador.innerText = `${lista.length} imóveis encontrados`;
}

// ==========================================
// 4. EVENTO DE CADASTRO (POST)
// ==========================================

if (addForm) {
    addForm.onsubmit = async (e) => {
        e.preventDefault();
        const file = document.getElementById('img-file').files[0];

        if (!file) {
            alert("Por favor, selecione uma imagem.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async function () {
            const novoImovel = {
                titulo: document.getElementById('title').value,
                descricao: document.getElementById('details').value,
                cidade: document.getElementById('address').value,
                preco: parseFloat(document.getElementById('price').value),
                quartos: parseInt(document.getElementById('quartos')?.value || 0),
                tipo: document.getElementById('type').value, // Adicionado o tipo
                imagem: reader.result,
                usuarioId: "00000000-0000-0000-0000-000000000000"
            };

            try {
                const response = await fetch('/imoveis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoImovel)
                });

                if (response.ok) {
                    alert("Imóvel cadastrado com sucesso!");
                    await carregarImoveisDoBanco();
                    closeModal();
                    addForm.reset();
                } else {
                    alert("Erro ao salvar no servidor.");
                }
            } catch (error) {
                console.error("Erro:", error);
            }
        };
        reader.readAsDataURL(file);
    };
}

// ==========================================
// 5. FUNÇÕES DE FILTRO (TEXTO E TIPO)
// ==========================================

// Filtro por Barra de Pesquisa
function filterProperties() {
    const busca = document.getElementById('search-input').value.toLowerCase();
    const filtrados = imoveis.filter(i =>
        i.titulo.toLowerCase().includes(busca) ||
        i.cidade.toLowerCase().includes(busca)
    );
    renderizar(filtrados);
}

// NOVA FUNÇÃO: Filtro pelos botões (Chips)
function filterByType(tipo) {
    // Estilização visual dos botões
    document.querySelectorAll('.chip').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (tipo === '') {
        renderizar(imoveis);
    } else {
        const filtrados = imoveis.filter(i => i.tipo === tipo);
        renderizar(filtrados);
    }
}

// ==========================================
// 6. MODAL
// ==========================================

function openModal() { document.getElementById('modal-add').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-add').style.display = 'none'; }