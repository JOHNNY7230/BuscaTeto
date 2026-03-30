document.addEventListener('DOMContentLoaded', () => {
    // 1. Selecionamos o formulário de login
    // No seu HTML, garanta que o form tenha o id="login-form"
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // Impede a página de recarregar
            e.preventDefault();

            // 2. Captura os valores digitados
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            // 3. Validação simples para permitir a entrada
            if (email !== "" && password !== "") {

                // Feedback visual (opcional)
                console.log("Login autorizado! Indo para BuscaTeto...");

                // 4. O REDIRECIONAMENTO PARA A DASHBOARD
                // O arquivo "dashboard.html" deve estar na mesma pasta
                window.location.href = "dashboard.html";

            } else {
                alert("Por favor, preencha todos os campos corretamente.");
            }
        });
    } else {
        console.error("Erro: Adicione id='login-form' na tag <form> do seu HTML de login.");
    }
});