// ==========================================
// FUNÇÃO PARA LER A IMAGEM COMO TEXTO (Base64)
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
// FUNÇÃO PARA BUSCAR E RENDERIZAR OS IMÓVEIS
// ==========================================
async function carregarImoveisDoBanco() {
    try {
        const response = await fetch('/imoveis');
        const imoveis = await response.json();

        const grid = document.getElementById('property-list');
        if (!grid) return;
        grid.innerHTML = '';

        const totalImoveis = imoveis.length;
        let receitaTotal = 0;
        let pendentes = 0;
        let alugados = 0;

        imoveis.forEach(imovel => {
            receitaTotal += imovel.preco;
            if (imovel.statusPagamento === 'Pago') {
                alugados++;
            } else {
                pendentes++;
            }

            const statusPagamento = imovel.statusPagamento || 'Pendente';
            const estiloTag = statusPagamento === 'Pago'
                ? 'background-color: #d1fae5; color: #065f46;'
                : 'background-color: #fef3c7; color: #92400e;';

            const foto = imovel.imagem || 'https://via.placeholder.com/300x200?text=Sem+Foto';

            grid.innerHTML += `
                <div class="property-card" style="border: 1px solid #eee; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div class="property-img" style="background-image: url('${foto}'); background-size: cover; background-position: center; height: 180px; border-radius: 12px 12px 0 0; position: relative;">
                        <span class="status-badge" style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px;">
                            ${imovel.tipo}
                        </span>
                    </div>
                    <div class="property-info" style="padding: 16px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 18px;">${imovel.titulo}</h3>
                        <p class="address" style="color: #666; font-size: 14px; margin-bottom: 16px;">${imovel.cidade}</p>
                        
                        <div class="price-row" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 12px;">
                            <span class="price" style="font-size: 18px; font-weight: bold; color: #2563eb;">
                                R$ ${imovel.preco.toFixed(2)}
                            </span>
                            <span class="tag" style="${estiloTag} padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                                ${statusPagamento}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });

        // Injeta os valores reais nos cards do Dashboard
        document.getElementById('dash-total').innerText = totalImoveis;
        document.getElementById('dash-alugados').innerText = alugados;
        document.getElementById('dash-pendentes').innerText = pendentes;
        document.getElementById('dash-receita').innerText = `R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    } catch (error) {
        console.error("Erro ao carregar os imóveis:", error);
    }
}

// ==========================================
// EVENTOS QUANDO A PÁGINA CARREGA
// ==========================================
window.addEventListener('load', () => {

    // 1. Acorda a página trazendo os dados reais
    carregarImoveisDoBanco();

    // 2. Prepara o botão de cadastro UMA ÚNICA VEZ
    const addForm = document.getElementById('add-form');

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fileInput = document.getElementById('imageInput');
            let fotoBase64 = "";

            if (fileInput.files.length > 0) {
                fotoBase64 = await lerFoto(fileInput.files[0]);
            }

            // ATENÇÃO AQUI: Certifique-se de que a variável usuarioLogadoId existe no seu projeto.
            // Se você pega ela do localStorage na hora do login, garanta que ela tem um valor!
           // Ajuste se necessário

            // Monta o imóvel com a foto e o ID convertido para NÚMERO
            const novoImovel = {
                titulo: document.getElementById('title').value,
                descricao: "Descrição padrão",
                preco: parseFloat(document.getElementById('price').value || "0"),
                quartos: 0,
                tipo: document.getElementById('type').value,
                imagem: fotoBase64,

                // 🔥 O CULPADO ESTAVA AQUI: Agora forçamos a virar número (int)
                usuarioId: sessionStorage.getItem('usuarioId') || "1",

                logradouro: "Não informado",
                numero: "S/N",
                bairro: "Centro",
                cidade: document.getElementById('address').value,
                cep: "00000-000"
            };
            console.log("🚀 Enviando para o C#:", novoImovel);

            try {
                const response = await fetch('/imoveis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoImovel)
                });

                if (response.ok) {
                    alert("✅ Imóvel cadastrado com sucesso!");
                    carregarImoveisDoBanco(); // Atualiza a tela sem dar F5
                    closeModal();
                    addForm.reset();
                } else {
                    const erroTexto = await response.text();
                    alert("❌ Erro do servidor: " + erroTexto);
                    console.error("Erro do C#:", erroTexto);
                }
            } catch (error) {
                alert("❌ Erro de conexão. O servidor C# está rodando?");
            }
        });
    }
});