document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: VERIFICAR SE O USUÁRIO ACABOU DE SE CADASTRAR ---
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('cadastrado') === 'true') {
        // Exibe o alerta de sucesso
        alert("Conta criada com sucesso no BuscaTeto! Faça seu login agora.");

        // Limpa o "?cadastrado=true" da barra de endereço para não repetir o alerta ao dar F5
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // --- PARTE 2: LÓGICA DE LOGIN ---
    // No seu HTML, garanta que o form tenha o id="login-form"
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // Impede a página de recarregar
            e.preventDefault();

            // Captura os valores digitados
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            // Validação simples para permitir a entrada
            if (email.trim() !== "" && password.trim() !== "") {

                console.log("Login autorizado! Indo para BuscaTeto...");

                // Redirecionamento para a Dashboard
                window.location.href = "dashboard.html";

            } else {
                alert("Por favor, preencha todos os campos corretamente.");
            }
        });
    } else {
        console.error("Erro: Adicione id='login-form' na tag <form> do seu HTML de login.");
    }
});