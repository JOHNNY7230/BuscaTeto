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
            tipoUsuario: document.querySelector('input[name="tipoUsuario"]:checked')?.value,
            senha: document.getElementById('senha').value
        };

        // Validações básicas antes de enviar
        if (!validarEmail(usuario.email)) {
            alert('E-mail inválido!');
            return;
        }

   // Garante que o usuário selecionou uma opção válida no select (Apagamos o 0591 daqui!)
        if (!usuario.tipoUsuario) {
            alert('Por favor, selecione se deseja ser Cliente ou Anunciante.');
            return;
        }

        // ========================================================
        // 🌍 ENVIANDO DADOS PARA A API C# (Salvando no MySQL real)
        // ========================================================
        try {
            // 🔥 MUDANÇA AQUI: Endereço completo apontando para o C# na porta 5005!
            // (Usando /api/usuarios para bater com o padrão do UsuariosController)
            const response = await fetch('api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                alert('Usuário cadastrado com sucesso!');
                // Redireciona direto para a página de login que existe na sua wwwroot
                window.location.href = 'login.html';
            } else {
                const erroTexto = await response.text();
                alert('Erro ao cadastrar: ' + erroTexto);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor. Verifique se o C# está rodando.');
        }
    });
});