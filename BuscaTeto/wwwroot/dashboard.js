// ==========================================
// 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================
const MEU_WHATSAPP = "5531987410591";
let imoveis = []; // Lista que armazenará os dados vindos do SQL Server

// Ao carregar a página, busca os dados no Banco de Dados
window.onload = async () => {
    await carregarImoveisDoBanco();
};

// ==========================================
// 2. COMUNICAÇÃO COM O BACKEND (C#)
// ==========================================

// Função para buscar imóveis (GET)
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
// 3. RENDERIZAÇÃO NA TELA (FRONTEND)
// ==========================================

function renderizar(lista) {
    const grid = document.getElementById('property-list');
    const contador = document.getElementById('counter');
    if (!grid) return;

    grid.innerHTML = "";

    lista.forEach(item => {
        // OBS: O C# envia os nomes em minúsculo (Ex: item.imagem em vez de item.Imagem)
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
// 4. EVENTO DE CADASTRO (POST) - addForm
// ==========================================

const addForm = document.getElementById('add-form');

if (addForm) {
    addForm.onsubmit = async (e) => {
        e.preventDefault(); // Não deixa a página recarregar

        const fileInput = document.getElementById('img-file');
        const file = fileInput.files[0];
        
        if (!file) {
            alert("Por favor, selecione uma imagem.");
            return;
        }

        const reader = new FileReader();

        // Quando o navegador terminar de converter a imagem para texto (Base64)...
        reader.onloadend = async function () {
            // Monta o objeto EXATAMENTE como o seu CriarImovelRequest.cs espera
            const novoImovel = {
                titulo: document.getElementById('title').value,
                descricao: document.getElementById('details').value, // Mapeia para string Descricao
                cidade: document.getElementById('address').value,    // Mapeia para string Cidade
                preco: parseFloat(document.getElementById('price').value), // Mapeia para decimal Preco
                quartos: parseInt(document.getElementById('quartos')?.value || 0), // Mapeia para int Quartos
                imagem: reader.result, // A imagem convertida em string
                usuarioId: "00000000-0000-0000-0000-000000000000" // Guid temporário (o C# exige um Guid válido)
            };

            try {
                // Envia o pacote para o seu Program.cs
                const response = await fetch('/imoveis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoImovel)
                });

                if (response.ok) {
                    alert("Imóvel cadastrado com sucesso no banco de dados!");
                    await carregarImoveisDoBanco(); // Recarrega a lista para mostrar o novo imóvel
                    closeModal(); // Fecha a janelinha
                    addForm.reset(); // Limpa os campos
                } else {
                    const erroTxt = await response.text();
                    alert("Erro ao salvar: " + erroTxt);
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro de conexão com o servidor.");
            }
        };

        reader.readAsDataURL(file); // Inicia a leitura do arquivo
    };
}

// ==========================================
// 5. FUNÇÕES DE UTILIDADE (FILTROS E MODAL)
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
    if(modal) modal.style.display = 'flex'; 
}

function closeModal() { 
    const modal = document.getElementById('modal-add');
    if(modal) modal.style.display = 'none'; 
}