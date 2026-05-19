document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formCadastro');
    const inputTelefone = document.getElementById('telefone');

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Máscara de Telefone
    inputTelefone.addEventListener('input', (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Criando o objeto usuário incluindo a escolha do tipo
        const usuario = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: inputTelefone.value,
            tipoUsuario: document.getElementById('tipoUsuario').value,
            senha: document.getElementById('senha').value
        };

        // Validações básicas antes de enviar
        if (!validarEmail(usuario.email)) {
            alert('E-mail inválido!');
            return;
        }

        // Garante que o usuário selecionou uma opção válida no select
        if (!usuario.tipoUsuario) {
            alert('Por favor, selecione se deseja ser Cliente ou Anunciante.');
            return;
        }

        // ========================================================
        // 🛠️ MODO SIMULAÇÃO (Para testar o Front-end sem o Banco)
        // ========================================================
        try {
            console.log("Dados capturados no Front (Seriam enviados ao MySQL):", usuario);

            // Salvamos os dados de teste no navegador para o login conseguir ler depois
            sessionStorage.setItem('usuarioFicticioEmail', usuario.email);
            sessionStorage.setItem('usuarioFicticioSenha', usuario.senha);
            sessionStorage.setItem('usuarioFicticioNome', usuario.nome);
            sessionStorage.setItem('usuarioFicticioTipo', usuario.tipoUsuario);

            alert(`Conta de ${usuario.tipoUsuario} criada com sucesso (Modo Teste)!`);

            // Redireciona para o arquivo de login (Se a sua tela for index.html ou login.html)
            // IMPORTANTE: Ajuste o nome abaixo para o arquivo real da sua tela de login se necessário
            window.location.href = 'index.html?cadastrado=true';

        } catch (error) {
            console.error('Erro na simulação:', error);
            alert('Erro ao processar o cadastro fictício.');
        }

        // ========================================================
        // 🌍 CÓDIGO DO FETCH COM A API (Comentado até o Back-end ficar pronto)
        // ========================================================
        /*
        try {
            const response = await fetch('/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                window.location.href = 'index.html?cadastrado=true';
            } else {
                const erroTexto = await response.text();
                alert('Erro ao cadastrar: ' + erroTexto);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor.');
        }
        */
    });
});