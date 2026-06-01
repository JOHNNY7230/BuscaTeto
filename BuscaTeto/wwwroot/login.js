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
    const senhaInput = document.getElementById('user-pass');

    // Referências das mensagens de erro
    const loginInvalidMsg = document.getElementById('login-invalid-msg');
    const emailFormatError = document.getElementById('email-format-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Resetar mensagens de erro a cada nova tentativa
            if (loginInvalidMsg) loginInvalidMsg.style.display = 'none';
            if (emailFormatError) emailFormatError.style.display = 'none';

            // 1. Validação de formato de e-mail (Frontend)
            if (emailInput && !emailInput.checkValidity()) {
                if (emailFormatError) emailFormatError.style.display = 'block';
                return;
            }

            const emailDigitado = emailInput.value.trim();
            const senhaDigitada = senhaInput.value;

            try {
                // Dispara a requisição para o C#
                const response = await fetch('/api/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailDigitado, senha: senhaDigitada })
                });

                // Lê a resposta como texto antes para evitar quebra do JSON se o C# retornar vazio
                const respostaTexto = await response.text();
                let data = {};

                if (respostaTexto) {
                    try {
                        data = JSON.parse(respostaTexto);
                    } catch (err) {
                        console.warn("A resposta não é um JSON válido:", respostaTexto);
                    }
                }

                // Analisa o Status Code retornado pelo Controller
                if (response.ok) {
                    // Status 200: Sucesso
                    sessionStorage.setItem('usuarioId', data.id);
                    sessionStorage.setItem('usuarioNome', data.nome);
                    sessionStorage.setItem('tipoUsuario', data.tipoUsuario);

                    // Redirecionamento dinâmico
                    window.location.href = data.tipoUsuario === 'Anunciante' ? "anunciante.html" : "cliente.html";

                } else if (response.status === 401) {
                    // Status 401: Não autorizado (E-mail ou senha incorretos)
                    if (loginInvalidMsg) {
                        loginInvalidMsg.style.display = 'block';
                        loginInvalidMsg.innerText = data.mensagem || "E-mail ou senha incorretos.";
                    } else {
                        alert(data.mensagem || "E-mail ou senha incorretos.");
                    }

                } else {
                    // Outros erros (400, 500, etc)
                    console.error("Erro do Servidor:", response.status, respostaTexto);
                    alert("Erro " + response.status + ": " + (data.mensagem || "Verifique o Console do navegador."));
                }

            } catch (error) {
                // Cai aqui se a API estiver desligada ou houver queda de internet
                console.error("Erro de Conexão:", error);
                alert("Erro na conexão com o servidor. Verifique se a API do BuscaTeto está rodando.");
            }
        });
    }
});