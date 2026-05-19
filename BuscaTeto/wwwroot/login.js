document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: VERIFICAR SE O USUÁRIO ACABOU DE SE CADASTRAR ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cadastrado') === 'true') {
        alert("Conta criada com sucesso no BuscaTeto! Faça seu login agora.");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // --- PARTE 2: LÓGICA DE LOGIN INTEGRADA COM O BACKEND ---
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('user-email');

    // Referências das mensagens de erro
    const loginInvalidMsg = document.getElementById('login-invalid-msg');
    const emailFormatError = document.getElementById('email-format-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Resetar mensagens de erro a cada nova tentativa
            loginInvalidMsg.style.display = 'none';
            emailFormatError.style.display = 'none';

            // 1. Validação de formato de e-mail (Frontend)
            if (!emailInput.checkValidity()) {
                emailFormatError.style.display = 'block';
                return;
            }

            const emailDigitado = emailInput.value;
            const senhaDigitada = document.getElementById('user-pass').value;

            // Cria o objeto exatamente como a classe LoginRequest do C# espera
            const dadosLogin = {
                email: emailDigitado,
                senha: senhaDigitada
            };

            try {
                // 2. Faz a requisição POST diretamente para o endpoint de login seguro
                const response = await fetch('/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosLogin)
                });

                // 3. Se as credenciais estiverem corretas (Status 200 OK)
                if (response.ok) {
                    const usuarioEncontrado = await response.json();

                    console.log("Login autorizado!");

                    // Guarda os dados retornados pelo C# na sessão do navegador
                    sessionStorage.setItem('usuarioId', usuarioEncontrado.id);
                    sessionStorage.setItem('usuarioNome', usuarioEncontrado.nome);
                    sessionStorage.setItem('tipoUsuario', usuarioEncontrado.tipoUsuario);

                    // 4. REDIRECIONAMENTO INTELIGENTE BASEADO NO PERFIL
                    if (usuarioEncontrado.tipoUsuario === 'Anunciante') {
                        window.location.href = "anunciante.html";
                    } else {
                        window.location.href = "cliente.html";
                    }

                } else if (response.status === 401) {
                    // Se o back-end responder com 401 (Não autorizado), mostra o erro na tela
                    loginInvalidMsg.style.display = 'block';
                } else {
                    alert("Ocorreu um problema inesperado no servidor.");
                }

            } catch (error) {
                console.error("Erro no processo de login:", error);
                alert("O servidor está offline ou houve um erro de conexão.");
            }
        });
    }
});