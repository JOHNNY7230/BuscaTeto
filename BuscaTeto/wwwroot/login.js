document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: VERIFICAR SE O USUÁRIO ACABOU DE SE CADASTRAR ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cadastrado') === 'true') {
        alert("Conta criada com sucesso no BuscaTeto! Faça seu login agora.");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // --- PARTE 2: LÓGICA DE LOGIN REAL (CONECTADA AO BANCO) ---
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => { // Adicionamos 'async' aqui
            e.preventDefault();

            // Usando os IDs que vi no seu HTML anterior
            const emailDigitado = document.getElementById('user-email').value;
            const senhaDigitada = document.getElementById('user-pass').value;

            try {
                // 1. Busca a lista de usuários do seu Program.cs
                const response = await fetch('/usuarios');
                
                if (!response.ok) {
                    throw new Error("Erro ao consultar o servidor.");
                }

                const usuarios = await response.json();

                // 2. Procura se existe alguém com esse e-mail e senha
                const usuarioEncontrado = usuarios.find(u => 
                    u.email === emailDigitado && u.senha === senhaDigitada
                );

                if (usuarioEncontrado) {
                    console.log("Login autorizado para:", usuarioEncontrado.nome);
                    
                    // 3. Guarda o ID e o Nome do usuário na sessão do navegador
                    // Isso ajuda a saber quem está postando imóveis depois
                    sessionStorage.setItem('usuarioId', usuarioEncontrado.id);
                    sessionStorage.setItem('usuarioNome', usuarioEncontrado.nome);

                    // Redireciona para a Dashboard
                    window.location.href = "dashboard.html";
                } else {
                    alert("E-mail ou senha incorretos. Tente novamente.");
                }

            } catch (error) {
                console.error("Erro no processo de login:", error);
                alert("O servidor está offline ou houve um erro de conexão.");
            }
        });
    }
});