// CONFIGURAÇÃO: Seu número de WhatsApp (31 98741-0591)
const MEU_WHATSAPP = "5531987410591";

// CARREGA OS IMÓVEIS SALVOS NO NAVEGADOR OU USA O PADRÃO
let imoveis = JSON.parse(localStorage.getItem('buscaTeto_db')) || [
    {
        id: 1,
        titulo: "Apartamento Garden Jardins",
        preco: 4500,
        tipo: "Apartamento",
        address: "Jardins, São Paulo",
        details: "2 Quartos • 80m²",
        img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400"
    }
];

window.onload = () => renderizar(imoveis);

// SALVAR NO NAVEGADOR
function salvarDados() {
    localStorage.setItem('buscaTeto_db', JSON.stringify(imoveis));
}

function renderizar(lista) {
    const grid = document.getElementById('property-list');
    const contador = document.getElementById('counter');
    if (!grid) return;

    grid.innerHTML = "";

    lista.forEach(item => {
        const mensagem = encodeURIComponent(`Olá! Vi o anúncio "${item.titulo}" no BuscaTeto e tenho interesse.`);
        const linkWhats = `https://wa.me/${MEU_WHATSAPP}?text=${mensagem}`;

        grid.innerHTML += `
            <div class="card">
                <div class="card-img" style="background-image: url('${item.img}'); background-size: cover; background-position: center;"></div>
                <div class="card-content">
                    <div class="card-price">R$ ${item.preco.toLocaleString('pt-BR')}</div>
                    <h3 class="card-title">${item.titulo}</h3>
                    <p style="color: #2563eb; font-weight: 600; font-size: 0.85rem; margin-bottom: 5px;">📍 ${item.address}</p>
                    <p class="card-info">${item.tipo} • ${item.details}</p>
                    <a href="${linkWhats}" target="_blank" class="btn-whatsapp" style="display: block; text-align: center; background: #25D366; color: white; text-decoration: none; padding: 12px; border-radius: 10px; margin-top: 15px; font-weight: bold;">
                        Tenho Interesse
                    </a>
                </div>
            </div>
        `;
    });

    if (contador) contador.innerText = `${lista.length} imóveis encontrados`;
}

// CADASTRO DE IMÓVEL COM IMAGEM PERSONALIZADA
// CADASTRO DE IMÓVEL COM ARQUIVO LOCAL
const addForm = document.getElementById('add-form');
if (addForm) {
    addForm.onsubmit = (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('img-file');
        const file = fileInput.files[0]; // Pega o arquivo selecionado
        const reader = new FileReader();

        // Quando o navegador terminar de ler a imagem...
        reader.onloadend = function () {
            const novo = {
                id: Date.now(),
                titulo: document.getElementById('title').value,
                preco: Number(document.getElementById('price').value),
                address: document.getElementById('address').value,
                type: document.getElementById('type').value,
                details: document.getElementById('details').value,
                // A imagem agora é o resultado da leitura do arquivo local
                img: reader.result
            };

            imoveis.unshift(novo);
            salvarDados(); // Salva no LocalStorage (incluindo a foto!)
            renderizar(imoveis);
            closeModal();
            addForm.reset();
        }

        if (file) {
            reader.readAsDataURL(file); // Inicia a leitura da imagem
        } else {
            alert("Por favor, selecione uma imagem.");
        }
    };
}

// FILTROS
function filterProperties() {
    const busca = document.getElementById('search-input').value.toLowerCase();
    const filtrados = imoveis.filter(i =>
        i.titulo.toLowerCase().includes(busca) ||
        i.address.toLowerCase().includes(busca)
    );
    renderizar(filtrados);
}

function filterByType(tipo) {
    const filtrados = tipo ? imoveis.filter(i => i.tipo === tipo) : imoveis;
    renderizar(filtrados);
}

function openModal() { document.getElementById('modal-add').style.display = 'flex'; }
function closeModal() { document.getElementById('modal-add').style.display = 'none'; }