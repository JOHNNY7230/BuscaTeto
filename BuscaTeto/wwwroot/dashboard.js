// ==========================================
// 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================
const MEU_WHATSAPP = "5531987410591";
let imoveis = [];
let map;
let markersGroup;

// Ao carregar a página, inicializa o mapa e busca os dados no Banco de Dados
window.onload = async () => {
    initMap();
    await carregarImoveisDoBanco();
};

// Inicialização do OpenStreetMap
function initMap() {
    // Foca inicialmente em uma posição central (ex: BH)
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
    markersGroup.clearLayers(); // Limpa os pins antigos do mapa

    lista.forEach(item => {
        // --- LÓGICA DO MAPA ---
        // Se o banco não trouxer lat/lng, usamos uma posição baseada no ID para teste
        const lat = item.latitude || (-19.9167 + (Math.random() * 0.05));
        const lng = item.longitude || (-43.9345 + (Math.random() * 0.05));

        L.marker([lat, lng])
            .addTo(markersGroup)
            .bindPopup(`<b>${item.titulo}</b><br>R$ ${item.preco.toLocaleString('pt-BR')}`);

        // --- LÓGICA DO CARD ---
        const mensagem = encodeURIComponent(`Olá! Vi o anúncio "${item.titulo}" no BuscaTeto e tenho interesse.`);
        const linkWhats = `https://wa.me/${MEU_WHATSAPP}?text=${mensagem}`;

        grid.innerHTML += `
            <div class="card">
                <div class="card-img" style="background-image: url('${item.imagem}'); background-size: cover; background-position: center;"></div>
                <div class="card-content">
                    <div class="card-price">R$ ${item.preco.toLocaleString('pt-BR')}</div>
                    <h3 class="card-title">${item.titulo}</h3>
                    <p style="color: #2563eb; font-weight: 600; font-size: 0.85rem; margin-bottom: 5px;">📍 ${item.cidade}</p>
                    <p class="card-info">Quartos: ${item.quartos} • ${item.descricao || ''}</p>
                    <a href="${linkWhats}" target="_blank" class="btn-whatsapp" style="display: block; text-align: center; background: #25D366; color: white; text-decoration: none; padding: 12px; border-radius: 10px; margin-top: 15px; font-weight: bold;">
                        Tenho Interesse
                    </a>
                </div>
            </div>
        `;
    });

    if (contador) contador.innerText = `${lista.length} imóveis encontrados`;
}

// ==========================================
// 4. EVENTO DE CADASTRO (POST)
// ==========================================

const addForm = document.getElementById('add-form');

if (addForm) {
    addForm.onsubmit = async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('img-file');
        const file = fileInput.files[0];

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
                imagem: reader.result,
                usuarioId: "00000000-0000-0000-0000-000000000000" // Guid padrão
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
                    const erroTxt = await response.text();
                    alert("Erro ao salvar: " + erroTxt);
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro de conexão com o servidor.");
            }
        };

        reader.readAsDataURL(file);
    };
}

// ==========================================
// 5. FILTROS
// ==========================================

function filterProperties() {
    const busca = document.getElementById('search-input').value.toLowerCase();
    const filtrados = imoveis.filter(i =>
        i.titulo.toLowerCase().includes(busca) ||
        i.cidade.toLowerCase().includes(busca)
    );
    renderizar(filtrados);
}

function openModal() {
    const modal = document.getElementById('modal-add');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('modal-add');
    if (modal) modal.style.display = 'none';
}