// ==========================================
// VARIÁVEL GLOBAL PARA OS FILTROS
// ==========================================
let todosImoveis = [];

// ==========================================
// FUNÇÕES DE UTILIDADE
// ==========================================
function lerFoto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// ==========================================
// FUNÇÃO PARA BUSCAR OS DADOS DO BANCO
// ==========================================
async function carregarImoveisDoBanco() {
    try {
        const usuarioId = sessionStorage.getItem('usuarioId') || "1";

        const response = await fetch('/imoveis');
        const data = await response.json();

        todosImoveis = data.filter(imovel => imovel.usuarioId == usuarioId);

        atualizarDashboard(todosImoveis);
        renderizarCards(todosImoveis);
        renderizarControle(todosImoveis); // NOVA ABA INJETADA AQUI
        renderizarFinanceiro(todosImoveis);

    } catch (error) {
        console.error("Erro ao carregar os imóveis:", error);
    }
}

// ==========================================
// DASHBOARD (Visão Geral)
// ==========================================
function atualizarDashboard(imoveis) {
    let receitaTotal = 0;
    let pendentes = 0;
    let alugados = 0;

    imoveis.forEach(imovel => {
        if (imovel.statusImovel === 'Alugado') {
            receitaTotal += imovel.preco;
            alugados++;

            if (imovel.statusPagamento === 'Pendente' || imovel.statusPagamento === 'Atrasado') {
                pendentes++;
            }
        }
    });

    document.getElementById('dash-total').innerText = imoveis.length;
    document.getElementById('dash-alugados').innerText = alugados;
    document.getElementById('dash-pendentes').innerText = pendentes;
    document.getElementById('dash-receita').innerText = `R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// ==========================================
// ABA: CONTROLAR IMÓVEIS (MINIMALISTA)
// ==========================================
function renderizarControle(imoveis) {
    const listaVagos = document.getElementById('lista-vagos');
    const listaAlugados = document.getElementById('lista-alugados');

    if (!listaVagos || !listaAlugados) return;

    listaVagos.innerHTML = '';
    listaAlugados.innerHTML = '';

    const vagos = imoveis.filter(i => i.statusImovel !== 'Alugado');
    const alugados = imoveis.filter(i => i.statusImovel === 'Alugado');

    if (vagos.length === 0) {
        listaVagos.innerHTML = '<p style="color: #64748b; font-size: 0.9rem; padding: 10px;">Não há imóveis disponíveis no momento.</p>';
    } else {
        vagos.forEach(imovel => {
            listaVagos.innerHTML += `
                <div class="minimal-item">
                    <div class="minimal-info">
                        <h4>${imovel.titulo}</h4>
                        <p><i class="fa-solid fa-location-dot"></i> ${imovel.cidade || 'Não informado'}</p>
                    </div>
                    <div>
                        <button class="btn-primary" onclick="prepararAluguel(${imovel.id})" style="padding: 8px 16px; font-size: 0.9rem;">
                            <i class="fa-solid fa-handshake"></i> Definir Inquilino
                        </button>
                    </div>
                </div>
            `;
        });
    }

    if (alugados.length === 0) {
        listaAlugados.innerHTML = '<p style="color: #64748b; font-size: 0.9rem; padding: 10px;">Você ainda não tem imóveis alugados.</p>';
    } else {
        alugados.forEach(imovel => {
            listaAlugados.innerHTML += `
                <div class="minimal-item">
                    <div class="minimal-info">
                        <h4>${imovel.titulo}</h4>
                        <p><i class="fa-solid fa-location-dot"></i> ${imovel.cidade || 'Não informado'}</p>
                    </div>
                    <div class="minimal-tenant">
                        <i class="fa-solid fa-user-check"></i> Inquilino ID: ${imovel.inquilinoId || 'N/A'}
                    </div>
                </div>
            `;
        });
    }
}
// ==========================================
// GRID DE IMÓVEIS (Aba: Meus Imóveis - Blindada)
// ==========================================
function renderizarCards(imoveisParaRenderizar) {
    const grid = document.getElementById('property-list');
    if (!grid) return;
    grid.innerHTML = '';

    if (imoveisParaRenderizar.length === 0) {
        grid.innerHTML = '<p style="color: #64748b; padding: 20px;">Nenhum imóvel encontrado.</p>';
        return;
    }

    imoveisParaRenderizar.forEach(imovel => {
        // Defesa de propriedades maiúsculas/minúsculas vindo do C#
        const idOriginal = imovel.id || imovel.Id;
        const statusImovel = imovel.statusImovel || imovel.StatusImovel;
        const titulo = imovel.titulo || imovel.Titulo;
        const cidade = imovel.cidade || imovel.Cidade || 'Não informado';
        const preco = imovel.preco || imovel.Preco || 0;
        const tipo = imovel.tipo || imovel.Tipo || 'Imóvel';
        const imagem = imovel.imagem || imovel.Imagem;

        const isAlugado = statusImovel === 'Alugado';
        const statusClass = isAlugado ? 'badge-alugado' : 'badge-vago';
        const statusText = isAlugado ? 'Alugado' : 'Vago';

        const foto = imagem || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
        const tipoIcone = tipo === 'Apartamento' ? 'fa-building' : 'fa-house';

        grid.innerHTML += `
            <div class="property-card">
                <div class="property-img clickable-img" onclick="abrirDetalhes(${idOriginal})" title="Clique para ver detalhes" style="cursor: pointer;">
                    <img src="${foto}" alt="${titulo}">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="property-info">
                    <div class="type-badge"><i class="fa-solid ${tipoIcone}"></i> ${tipo}</div>
                    <h3>${titulo}</h3>
                    <p class="address"><i class="fa-solid fa-location-dot"></i> ${cidade}</p>
                    <div class="price-row">
                        <span class="price">R$ ${preco.toFixed(2)}<span>/mês</span></span>
                        <button class="btn-icon" title="Configurações"><i class="fa-solid fa-gear"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ==========================================
// FUNÇÃO: ABRIR DETALHES DO IMÓVEL (Blindada + WhatsApp)
// ==========================================
function abrirDetalhes(id) {
    // Procura aceitando tanto i.id quanto i.Id
    const imovel = todosImoveis.find(i => (i.id == id || i.Id == id));
    if (!imovel) {
        console.error("Mapeamento falhou para o ID:", id);
        return;
    }

    // Mapeamento seguro das variáveis
    const titulo = imovel.titulo || imovel.Titulo || "Sem título";
    const imagem = imovel.imagem || imovel.Imagem || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';
    const preco = imovel.preco || imovel.Preco || 0;
    const descricao = imovel.descricao || imovel.Descricao || "Casa com excelente iluminação natural, ambientes amplos e bem ventilados. Ótima localização próxima a comércios.";
    const logradouro = imovel.logradouro || imovel.Logradouro || "Não informado";
    const numero = imovel.numero || imovel.Numero || "S/N";
    const bairro = imovel.bairro || imovel.Bairro || "Centro";
    const cidade = imovel.cidade || imovel.Cidade || "Belo Horizonte";
    const cep = imovel.cep || imovel.Cep || "00000-000";
    const quartos = imovel.quartos || imovel.Quartos || 3;

    // Injeta os dados corrigidos no Modal
    document.getElementById('detalhe-imagem').src = imagem;
    document.getElementById('detalhe-titulo').innerText = titulo;
    document.getElementById('detalhe-preco-tag').innerText = `R$ ${preco.toFixed(2)}`;
    document.getElementById('detalhe-descricao').innerText = descricao;
    document.getElementById('detalhe-endereco').innerText = `${logradouro}, ${numero} - ${bairro}, ${cidade}`;
    document.getElementById('detalhe-cep').innerText = cep;
    document.getElementById('detalhe-quartos').innerText = `${quartos} Quarto(s)`;
    document.getElementById('detalhe-area').innerText = imovel.area || imovel.Area ? `${imovel.area || imovel.Area} m²` : '120 m²';

    // CONFIGURAÇÃO DINÂMICA DO LINK DO WHATSAPP
    const mensagemWhats = encodeURIComponent(`Olá! Vi o anúncio do imóvel "${titulo}" no BuscaTeto e gostaria de mais informações.`);
    // Coloquei um número de exemplo do DDD 31, altere para o número real se quiser testar!
    document.getElementById('detalhe-whatsapp').href = `https://wa.me/5531999999999?text=${mensagemWhats}`;

    openModal('modal-detalhes');
}
// ==========================================
// TABELA FINANCEIRA
// ==========================================
function renderizarFinanceiro(imoveis) {
    const tbody = document.getElementById('tabela-financeiro-corpo');
    if (!tbody) return;
    tbody.innerHTML = '';

    const imoveisAlugados = imoveis.filter(i => i.statusImovel === 'Alugado');

    if (imoveisAlugados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #64748b;">Nenhum imóvel alugado no momento.</td></tr>`;
        return;
    }

    imoveisAlugados.forEach(imovel => {
        const isPago = imovel.statusPagamento === 'Pago';

        const tagStatus = isPago
            ? `<span class="tag tag-pago"><i class="fa-solid fa-check"></i> Pago</span>`
            : `<span class="tag tag-pendente"><i class="fa-regular fa-clock"></i> ${imovel.statusPagamento || 'Pendente'}</span>`;

        const btnAcao = isPago
            ? `<button class="btn-action btn-view"><i class="fa-solid fa-file-invoice"></i> Ver Recibo</button>`
            : `<button class="btn-action btn-cobrar" onclick="alert('Cobrança enviada com sucesso!')"><i class="fa-regular fa-bell"></i> Enviar Cobrança</button>`;

        tbody.innerHTML += `
            <tr>
                <td><div class="table-imovel-info"><strong>${imovel.titulo}</strong><span class="text-muted">${imovel.cidade}</span></div></td>
                <td><div class="inquilino-info"><i class="fa-solid fa-user-check"></i> ID: ${imovel.inquilinoId || 'N/A'}</div></td>
                <td><span class="vencimento-tag">Todo dia ${imovel.diaVencimento || '10'}</span></td>
                <td><strong>R$ ${imovel.preco ? imovel.preco.toFixed(2) : '0.00'}</strong></td>
                <td>${tagStatus}</td>
                <td>${btnAcao}</td>
            </tr>
        `;
    });
}

// ==========================================
// FUNÇÕES DE AÇÃO DOS MODAIS
// ==========================================
unction prepararAluguel(imovelId) {
    document.getElementById('alugar-imovel-id').value = imovelId;
    openModal('modal-alugar');
}

// COLA A NOVA FUNÇÃO AQUI NESSE ESPAÇO:
// ==========================================
// ==========================================
// FUNÇÃO: ABRIR DETALHES DO IMÓVEL
// ==========================================
function abrirDetalhes(id) {
    const imovel = todosImoveis.find(i => i.id === id);
    if (!imovel) return;

    document.getElementById('detalhe-imagem').src = imovel.imagem || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';
    document.getElementById('detalhe-titulo').innerText = imovel.titulo;
    document.getElementById('detalhe-preco-tag').innerText = `R$ ${imovel.preco ? imovel.preco.toFixed(2) : '0.00'}`;

    // Tratamento da descrição
    document.getElementById('detalhe-descricao').innerText = imovel.descricao && imovel.descricao !== "Descrição padrão"
        ? imovel.descricao
        : "Casa com excelente iluminação natural, ambientes amplos e bem ventilados. Ótima localização próxima a comércios e vias de acesso fácil.";

    // Tratamento do endereço
    const endereco = `${imovel.logradouro || 'Rua não informada'}, ${imovel.numero || 'S/N'} - ${imovel.bairro || 'Bairro não informado'}, ${imovel.cidade || 'Cidade não informada'}`;
    document.getElementById('detalhe-endereco').innerText = endereco;

    // Especificações e Metros²
    document.getElementById('detalhe-cep').innerText = imovel.cep || 'CEP não informado';
    document.getElementById('detalhe-quartos').innerText = imovel.quartos ? `${imovel.quartos} Quarto(s)` : '3 Quarto(s)';

    // Colocando um valor padrão de m² para apresentação, já que não temos no C#
    document.getElementById('detalhe-area').innerText = imovel.area ? `${imovel.area} m²` : '120 m²';

    openModal('modal-detalhes');
}// ==========================================
// EVENTOS QUANDO A PÁGINA CARREGA
// ==========================================
window.addEventListener('load', () => {

    carregarImoveisDoBanco();

    // Lógica dos filtros (Todos, Alugados, Vagos) na vitrine
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            chips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');

            const filtro = e.target.innerText;
            if (filtro === 'Todos') {
                renderizarCards(todosImoveis);
            } else if (filtro === 'Alugados') {
                renderizarCards(todosImoveis.filter(i => i.statusImovel === 'Alugado'));
            } else if (filtro === 'Vagos') {
                renderizarCards(todosImoveis.filter(i => i.statusImovel !== 'Alugado'));
            }
        });
    });

    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const labelBox = e.target.parentElement.querySelector('span');
                if (labelBox) labelBox.innerText = e.target.files[0].name;
            }
        });
    }

    // ==========================================
    // ENVIO: CADASTRAR NOVO IMÓVEL
    // ==========================================
    const addForm = document.getElementById('add-form');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fileInput = document.getElementById('imageInput');
            let fotoBase64 = "";

            if (fileInput.files.length > 0) {
                fotoBase64 = await lerFoto(fileInput.files[0]);
            }

            const novoImovel = {
                titulo: document.getElementById('title').value,
                descricao: "Descrição padrão",
                preco: parseFloat(document.getElementById('price').value || "0"),
                quartos: 0,
                tipo: document.getElementById('type').value,
                imagem: fotoBase64,
                usuarioId: sessionStorage.getItem('usuarioId') || "1",
                logradouro: "Não informado",
                numero: "S/N",
                bairro: "Centro",
                cidade: document.getElementById('address').value,
                cep: "00000-000"
            };

            try {
                const response = await fetch('/imoveis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoImovel)
                });

                if (response.ok) {
                    alert("✅ Imóvel cadastrado com sucesso!");
                    carregarImoveisDoBanco();
                    closeModal('modal-add');
                    addForm.reset();
                    const labelBox = fileInput.parentElement.querySelector('span');
                    if (labelBox) labelBox.innerText = "Clique ou arraste uma foto aqui";
                } else {
                    const erroTexto = await response.text();
                    alert("❌ Erro do servidor: " + erroTexto);
                }
            } catch (error) {
                alert("❌ Erro de conexão com a API.");
            }
        });
    }

    // ==========================================
    // ENVIO: INFORMAR ALUGUEL (Rota PUT do C#)
    // ==========================================
    const alugarForm = document.getElementById('alugar-form');
    if (alugarForm) {
        alugarForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const imovelId = document.getElementById('alugar-imovel-id').value;
            const inquilinoId = parseInt(document.getElementById('inquilino-id').value);
            const diaVencimento = parseInt(document.getElementById('dia-vencimento').value);

            const payload = {
                inquilinoId: inquilinoId,
                diaVencimento: diaVencimento
            };

            try {
                const response = await fetch(`/imoveis/${imovelId}/alugar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("✅ Contrato ativado! O imóvel já está no seu controle financeiro.");
                    carregarImoveisDoBanco();
                    closeModal('modal-alugar');
                    alugarForm.reset();
                } else {
                    const erroTexto = await response.text();
                    alert("❌ Erro ao vincular inquilino: " + erroTexto);
                }
            } catch (error) {
                alert("❌ Erro de conexão com a API.");
            }
        });
    }
});