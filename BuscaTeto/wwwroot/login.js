document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: VERIFICAR SE O USUÁRIO ACABOU DE SE CADASTRAR ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cadastrado') === 'true') {
        alert("Conta criada com sucesso no BuscaTeto! Faça seu login agora.");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // --- PARTE 2: LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('user-email');

    // Referências das mensagens de erro
    const loginInvalidMsg = document.getElementById('login-invalid-msg');
    const emailFormatError = document.getElementById('email-format-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Resetar mensagens de erro a cada tentativa
            loginInvalidMsg.style.display = 'none';
            emailFormatError.style.display = 'none';

            // 1. Validação de formato de e-mail (Frontend)
            if (!emailInput.checkValidity()) {
                emailFormatError.style.display = 'block';
                return; // Para a execução aqui
            }

            const emailDigitado = emailInput.value;
            const senhaDigitada = document.getElementById('user-pass').value;

            try {
                // 2. Busca a lista de usuários do backend C#
                const response = await fetch('/usuarios');

                if (!response.ok) {
                    throw new Error("Erro ao consultar o servidor.");
                }

                const usuarios = await response.json();

                // 3. Verifica as credenciais
                const usuarioEncontrado = usuarios.find(u =>
                    u.email === emailDigitado && u.senha === senhaDigitada
                );

                if (usuarioEncontrado) {
                    console.log("Login autorizado!");
                    sessionStorage.setItem('usuarioId', usuarioEncontrado.id);
                    sessionStorage.setItem('usuarioNome', usuarioEncontrado.nome);
                    window.location.href = "dashboard.html";
                } else {
                    // Mostra a mensagem de "Login Inválido" no topo do card
                    loginInvalidMsg.style.display = 'block';
                }

            } catch (error) {
                console.error("Erro no processo de login:", error);
                alert("O servidor está offline ou houve um erro de conexão.");
            }
        });
    }
});