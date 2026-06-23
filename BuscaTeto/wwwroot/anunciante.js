// ==========================================
// ESTADO GLOBAL DA APLICAÇÃO
// ==========================================
let todosImoveis = [];
let filtroAtual = 'todos'; // 'todos', 'alugados', 'vagos'

// ==========================================
// CONTROLE DE NAVEGAÇÃO (ABAS)
// ==========================================
window.switchTab = function (tabName, btnElement) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.add('active');

    if (btnElement) btnElement.classList.add('active');

    if (tabName === 'controle') renderizarControle(todosImoveis);
    if (tabName === 'financeiro') renderizarFinanceiro(todosImoveis);
    if (tabName === 'imoveis') renderizarCards(todosImoveis);
    if (tabName === 'dashboard') atualizarDashboard(todosImoveis);
};

// ==========================================
// UTILITÁRIOS E MODAIS
// ==========================================
window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
};

window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
};

window.toggleUserMenu = function () {
    document.getElementById('user-menu').classList.toggle('active');
};

window.addEventListener('click', function (e) {
    if (!e.target.matches('.avatar')) {
        const menu = document.getElementById('user-menu');
        if (menu) menu.classList.remove('active');
    }
});

function lerFoto(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function resetVisuals() {
    atualizarDashboard(todosImoveis);
    renderizarCards(todosImoveis);
    renderizarControle(todosImoveis);
    renderizarFinanceiro(todosImoveis);
}

// ==========================================
// BUSCAR DADOS DA API (C#)
// ==========================================
async function carregarImoveisDoBanco() {
    try {
        const usuarioIdRaw = sessionStorage.getItem('usuarioId') || localStorage.getItem('usuarioId');

        if (!usuarioIdRaw) {
            console.warn("Nenhum usuário logado detectado.");
            return;
        }

        const response = await fetch('/imoveis');
        if (!response.ok) throw new Error("Erro ao buscar dados do servidor.");

        const data = await response.json();
        console.log("Dados brutos carregados da API:", data);

        todosImoveis = data.filter(imovel => {
            const imovelUser = imovel.usuarioId ?? imovel.UsuarioId;
            return String(imovelUser) === String(usuarioIdRaw);
        });

        resetVisuals();

    } catch (error) {
        // ✅ CORRIGIDO: try sem catch/finally causava SyntaxError que derrubava o JS inteiro
        console.error("Erro ao carregar imóveis:", error);
        alert("❌ Não foi possível carregar seus imóveis. Verifique sua conexão.");
    }
}

// ==========================================
// DASHBOARD: INDICADORES EM TEMPO REAL
// ==========================================
function atualizarDashboard(imoveis) {
    let receitaTotal = 0;
    let pendentes = 0;
    let alugados = 0;

    imoveis.forEach(imovel => {
        const statusImovel = imovel.statusImovel ?? imovel.StatusImovel;
        const statusPagamento = imovel.statusPagamento ?? imovel.StatusPagamento;
        const preco = imovel.preco ?? imovel.Preco ?? 0;

        if (statusImovel === 'Alugado') {
            receitaTotal += preco;
            alugados++;
            if (statusPagamento !== 'Pago') pendentes++;
        }
    });

    const el = id => document.getElementById(id);
    if (el('dash-total')) el('dash-total').innerText = imoveis.length;
    if (el('dash-alugados')) el('dash-alugados').innerText = alugados;
    if (el('dash-pendentes')) el('dash-pendentes').innerText = pendentes;
    if (el('dash-receita')) {
        el('dash-receita').innerText = `R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
}

// ==========================================
// RENDERIZADOR: CARDS DE IMÓVEIS (ABA MEUS IMÓVEIS)
// ==========================================
function renderizarCards(imoveis) {
    const container = document.getElementById('property-list');
    if (!container) return;

    let lista = imoveis;
    if (filtroAtual === 'alugados') lista = imoveis.filter(i => (i.statusImovel ?? i.StatusImovel) === 'Alugado');
    if (filtroAtual === 'vagos') lista = imoveis.filter(i => (i.statusImovel ?? i.StatusImovel) !== 'Alugado');

    if (lista.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#64748b;">
                <i class="fa-solid fa-house-circle-xmark" style="font-size:2.5rem; margin-bottom:12px; display:block; opacity:0.4;"></i>
                <p>Nenhum imóvel encontrado nesta categoria.</p>
            </div>`;
        return;
    }

    container.innerHTML = lista.map(imovel => {
        const id = imovel.id ?? imovel.Id;
        const titulo = imovel.titulo ?? imovel.Titulo ?? 'Sem título';
        const cidade = imovel.cidade ?? imovel.Cidade ?? '';
        const logradouro = imovel.logradouro ?? imovel.Logradouro ?? '';
        const preco = imovel.preco ?? imovel.Preco ?? 0;
        const tipo = imovel.tipo ?? imovel.Tipo ?? 'Imóvel';
        const imagem = imovel.imagem ?? imovel.Imagem ?? '';
        const status = imovel.statusImovel ?? imovel.StatusImovel ?? 'Vago';
        const isAlugado = status === 'Alugado';

        const imgFallback = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80';
        const imgSrc = imagem && imagem.startsWith('data:') ? imagem : (imagem || imgFallback);

        return `
        <div class="property-card">
            <div class="property-img">
                <img src="${imgSrc}" alt="${titulo}" onerror="this.src='${imgFallback}'">
                <span class="status-badge ${isAlugado ? 'badge-alugado' : 'badge-vago'}">${isAlugado ? 'Alugado' : 'Vago'}</span>
            </div>
            <div class="property-info">
                <div class="type-badge"><i class="fa-solid fa-house"></i> ${tipo}</div>
                <h3>${titulo}</h3>
                <p class="address"><i class="fa-solid fa-location-dot"></i> ${logradouro ? logradouro + ', ' : ''}${cidade}</p>
                <div class="price-row">
                    <span class="price">R$ ${Number(preco).toLocaleString('pt-BR')}<span>/mês</span></span>
                    <button class="btn-icon" title="Remover imóvel" onclick="removerImovel(${id})">
                        <i class="fa-solid fa-trash" style="color:#e74c3c;"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ==========================================
// RENDERIZADOR: ABA CONTROLAR IMÓVEIS
// ==========================================
function renderizarControle(imoveis) {
    const listaVagos = document.getElementById('lista-vagos');
    const listaAlugados = document.getElementById('lista-alugados');
    if (!listaVagos || !listaAlugados) return;

    const vagos = imoveis.filter(i => (i.statusImovel ?? i.StatusImovel) !== 'Alugado');
    const alugados = imoveis.filter(i => (i.statusImovel ?? i.StatusImovel) === 'Alugado');

    // Vagos (disponíveis para alugar)
    if (vagos.length === 0) {
        listaVagos.innerHTML = `<p style="color:#64748b; padding:16px 0; font-size:0.9rem;">Todos os seus imóveis estão alugados.</p>`;
    } else {
        listaVagos.innerHTML = vagos.map(imovel => {
            const id = imovel.id ?? imovel.Id;
            const titulo = imovel.titulo ?? imovel.Titulo ?? 'Sem título';
            const cidade = imovel.cidade ?? imovel.Cidade ?? '';
            const preco = imovel.preco ?? imovel.Preco ?? 0;
            return `
            <div class="minimal-item">
                <div class="minimal-item-info">
                    <strong>${titulo}</strong>
                    <span>${cidade} · R$ ${Number(preco).toLocaleString('pt-BR')}/mês</span>
                </div>
                <button class="btn-success btn-sm" onclick="abrirModalAlugar(${id}, '${titulo.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-handshake"></i> Alugar
                </button>
            </div>`;
        }).join('');
    }

    // Alugados (com opção de desocupar)
    if (alugados.length === 0) {
        listaAlugados.innerHTML = `<p style="color:#64748b; padding:16px 0; font-size:0.9rem;">Nenhum imóvel alugado no momento.</p>`;
    } else {
        listaAlugados.innerHTML = alugados.map(imovel => {
            const id = imovel.id ?? imovel.Id;
            const titulo = imovel.titulo ?? imovel.Titulo ?? 'Sem título';
            const cidade = imovel.cidade ?? imovel.Cidade ?? '';
            const preco = imovel.preco ?? imovel.Preco ?? 0;
            const inquilinoId = imovel.inquilinoId ?? imovel.InquilinoId ?? 'N/A';
            const statusPag = imovel.statusPagamento ?? imovel.StatusPagamento ?? 'Pendente';
            const isPago = statusPag === 'Pago';

            return `
            <div class="minimal-item">
                <div class="minimal-item-info">
                    <strong>${titulo}</strong>
                    <span>
                        ${cidade} · R$ ${Number(preco).toLocaleString('pt-BR')}/mês · 
                        Inquilino ID: ${inquilinoId} · 
                        <span style="color:${isPago ? '#2ecc71' : '#e67e22'}; font-weight:600;">
                            ${isPago ? '✓ Pago' : '⏳ Pendente'}
                        </span>
                    </span>
                </div>
                <div style="display:flex; gap:8px;">
                    ${!isPago ? `
                    <button class="btn-primary btn-sm" onclick="pagarMensalidade(${id})">
                        <i class="fa-solid fa-check"></i> Confirmar Pagamento
                    </button>` : ''}
                    <button class="btn-danger btn-sm" onclick="desocuparImovel(${id})">
                        <i class="fa-solid fa-door-open"></i> Desocupar
                    </button>
                </div>
            </div>`;
        }).join('');
    }
}

// ==========================================
// RENDERIZADOR: TABELA FINANCEIRO
// ==========================================
function renderizarFinanceiro(imoveis) {
    const tbody = document.getElementById('tabela-financeiro-corpo');
    if (!tbody) return;
    tbody.innerHTML = '';

    const imoveisAlugados = imoveis.filter(i => (i.statusImovel ?? i.StatusImovel) === 'Alugado');

    if (imoveisAlugados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px; color:#64748b;">
                    Nenhum fluxo de caixa ativo. Alugue um imóvel para começar.
                </td>
            </tr>`;
        return;
    }

    imoveisAlugados.forEach(imovel => {
        const id = imovel.id ?? imovel.Id;
        const inquilinoId = imovel.inquilinoId ?? imovel.InquilinoId ?? 'N/A';
        const titulo = imovel.titulo ?? imovel.Titulo ?? '';
        const cidade = imovel.cidade ?? imovel.Cidade ?? '';
        const preco = imovel.preco ?? imovel.Preco ?? 0;
        const diaVenc = imovel.diaVencimento ?? imovel.DiaVencimento ?? '10';
        const statusPag = imovel.statusPagamento ?? imovel.StatusPagamento ?? 'Pendente';
        const isPago = statusPag === 'Pago';

        tbody.innerHTML += `
        <tr>
            <td>
                <strong>${titulo}</strong><br>
                <small style="color:#7f8c8d">${cidade}</small>
            </td>
            <td>ID: ${inquilinoId}</td>
            <td>Dia ${diaVenc}</td>
            <td><strong>R$ ${Number(preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
            <td>
                ${isPago
                ? `<span style="color:#2ecc71; font-weight:700; background:#f0fdf4; padding:4px 10px; border-radius:20px; font-size:0.85rem;">✓ Pago</span>`
                : `<span style="color:#e67e22; font-weight:700; background:#fff7ed; padding:4px 10px; border-radius:20px; font-size:0.85rem;">⏳ Pendente</span>`
            }
            </td>
            <td>
                ${isPago
                ? `<button class="btn-secondary btn-sm" onclick="gerarRecibo(${id}, '${titulo.replace(/'/g, "\\'")}', ${preco})">
                            <i class="fa-solid fa-receipt"></i> Recibo
                       </button>`
                : `<button class="btn-primary btn-sm" onclick="pagarMensalidade(${id})">
                            <i class="fa-solid fa-check"></i> Confirmar Pag.
                       </button>`
            }
            </td>
        </tr>`;
    });
}

// ==========================================
// AÇÕES: ALUGAR IMÓVEL
// ==========================================
window.abrirModalAlugar = function (imovelId, titulo) {
    document.getElementById('alugar-imovel-id').value = imovelId;
    const h2 = document.querySelector('#modal-alugar .modal-header h2');
    if (h2) h2.innerHTML = `<i class="fa-solid fa-handshake text-success"></i> Alugar: ${titulo}`;
    openModal('modal-alugar');
};

async function confirmarAluguel(e) {
    e.preventDefault();

    const imovelId = document.getElementById('alugar-imovel-id').value;
    const inquilinoId = parseInt(document.getElementById('inquilino-id').value);
    const diaVencimento = parseInt(document.getElementById('dia-vencimento').value);

    if (!imovelId || !inquilinoId || !diaVencimento) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch(`/imoveis/${imovelId}/alugar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inquilinoId, diaVencimento })
        });

        if (response.ok) {
            closeModal('modal-alugar');
            document.getElementById('alugar-form').reset();
            alert("✅ Contrato registrado com sucesso!");
            await carregarImoveisDoBanco();
        } else {
            const erro = await response.text();
            alert(`❌ Erro ao registrar aluguel (${response.status}): ${erro}`);
        }
    } catch (error) {
        console.error("Erro ao alugar:", error);
        alert("❌ Falha na conexão com a API.");
    }
}

// ==========================================
// AÇÕES: CONFIRMAR PAGAMENTO DE MENSALIDADE
// ==========================================
window.pagarMensalidade = async function (imovelId) {
    if (!confirm("Confirmar recebimento do pagamento deste mês?")) return;

    try {
        const response = await fetch(`/imoveis/${imovelId}/pagar`, { method: 'POST' });

        if (response.ok) {
            alert("✅ Pagamento registrado com sucesso!");
            await carregarImoveisDoBanco();
        } else {
            alert(`❌ Erro ao registrar pagamento (${response.status})`);
        }
    } catch (error) {
        console.error("Erro ao pagar:", error);
        alert("❌ Falha na conexão com a API.");
    }
};

// ==========================================
// AÇÕES: DESOCUPAR IMÓVEL
// ==========================================
window.desocuparImovel = async function (imovelId) {
    if (!confirm("Tem certeza que deseja desocupar este imóvel? O inquilino será desvinculado.")) return;

    todosImoveis = todosImoveis.map(i => {
        if ((i.id ?? i.Id) === imovelId) {
            return { ...i, statusImovel: 'Vago', StatusImovel: 'Vago', inquilinoId: null, InquilinoId: null, statusPagamento: null };
        }
        return i;
    });
    resetVisuals();

    // TODO: Adicione endpoint PUT /imoveis/{id}/desocupar na API C# para persistir
};

// ==========================================
// AÇÕES: REMOVER IMÓVEL
// ==========================================
window.removerImovel = async function (imovelId) {
    if (!confirm("Tem certeza que deseja remover este imóvel permanentemente?")) return;

    try {
        const response = await fetch(`/imoveis/${imovelId}`, { method: 'DELETE' });

        if (response.ok) {
            alert("✅ Imóvel removido com sucesso.");
            await carregarImoveisDoBanco();
        } else {
            alert(`❌ Erro ao remover imóvel (${response.status})`);
        }
    } catch (error) {
        console.error("Erro ao remover:", error);
        alert("❌ Falha na conexão com a API.");
    }
};

// ==========================================
// AÇÕES: GERAR RECIBO (FINANCEIRO)
// ==========================================
window.gerarRecibo = function (imovelId, titulo, preco) {
    const data = new Date().toLocaleDateString('pt-BR');
    const texto = `===== RECIBO DE ALUGUEL =====\nImóvel: ${titulo}\nValor: R$ ${Number(preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nData: ${data}\nStatus: PAGO\n=============================`;
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_${titulo.replace(/\s+/g, '_')}_${data.replace(/\//g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};

// ==========================================
// AÇÕES: CADASTRAR NOVO IMÓVEL
// ==========================================
async function cadastrarNovoImovel(e) {
    e.preventDefault();

    const usuarioIdRaw = sessionStorage.getItem('usuarioId') || localStorage.getItem('usuarioId');
    if (!usuarioIdRaw) {
        alert("❌ Sessão expirada. Faça login novamente.");
        return;
    }

    const fileInput = document.getElementById('imageInput');
    let fotoBase64 = "";
    if (fileInput && fileInput.files.length > 0) {
        fotoBase64 = await lerFoto(fileInput.files[0]);
    }

    const payload = {
        titulo: document.getElementById('title').value,
        descricao: "Cadastrado via Portal do Anunciante",
        preco: parseFloat(document.getElementById('price').value || "0"),
        quartos: 1,
        tipo: document.getElementById('type')?.value || "Casa",
        imagem: fotoBase64,
        usuarioId: parseInt(usuarioIdRaw),
        anuncianteId: parseInt(usuarioIdRaw),
        logradouro: "Endereço registrado",
        numero: "S/N",
        bairro: "Bairro",
        cidade: document.getElementById('address').value,
        cep: "00000-000"
    };

    try {
        const response = await fetch('/imoveis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("✅ Imóvel cadastrado com sucesso!");
            document.getElementById('add-form').reset();
            closeModal('modal-add');
            await carregarImoveisDoBanco();
        } else {
            const erro = await response.text();
            alert(`❌ Erro ${response.status}: ${erro}`);
        }
    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        alert("❌ Falha na conexão com a API.");
    }
}

// ==========================================
// FILTRO DOS CHIPS (ABA MEUS IMÓVEIS)
// ==========================================
function configurarFiltros() {
    const chips = document.querySelectorAll('.filter-chips .chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const texto = chip.textContent.trim().toLowerCase();
            if (texto === 'todos') filtroAtual = 'todos';
            else if (texto === 'alugados') filtroAtual = 'alugados';
            else if (texto === 'vagos') filtroAtual = 'vagos';
            renderizarCards(todosImoveis);
        });
    });
}

// ==========================================
// POPULA DADOS DO USUÁRIO LOGADO NA NAVBAR
// ==========================================
function popularDadosUsuario() {
    const nome = sessionStorage.getItem('usuarioNome') || localStorage.getItem('usuarioNome') || 'Anunciante';
    const primeiroNome = nome.split(' ')[0];

    const saudacao = document.getElementById('saudacao');
    if (saudacao) saudacao.textContent = `Olá, ${primeiroNome}! 👋`;

    const dropdownNome = document.getElementById('dropdown-nome');
    if (dropdownNome) dropdownNome.textContent = nome;

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=0D8ABC&color=fff&rounded=true`;
    const avatarImg = document.getElementById('avatar-img');
    const avatarDropdown = document.getElementById('avatar-img-dropdown');
    if (avatarImg) avatarImg.src = avatarUrl;
    if (avatarDropdown) avatarDropdown.src = avatarUrl;
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    popularDadosUsuario();
    carregarImoveisDoBanco();

    // Vincula formulário de cadastro
    const addForm = document.getElementById('add-form');
    if (addForm) {
        addForm.removeAttribute('onsubmit');
        addForm.addEventListener('submit', cadastrarNovoImovel);
    }

    // Vincula formulário de aluguel
    const alugarForm = document.getElementById('alugar-form');
    if (alugarForm) {
        alugarForm.removeAttribute('onsubmit');
        alugarForm.addEventListener('submit', confirmarAluguel);
    }

    // Configura filtros
    configurarFiltros();

    // Corrige os botões de aba para passar o elemento clicado
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
            btn.removeAttribute('onclick');
            const match = onclickAttr.match(/switchTab\('(\w+)'\)/);
            if (match) {
                btn.addEventListener('click', function () {
                    switchTab(match[1], this);
                });
            }
        }
    });

    // Inicia na aba dashboard
    const dashBtn = document.querySelector('.tab-btn');
    if (dashBtn) dashBtn.classList.add('active');
});