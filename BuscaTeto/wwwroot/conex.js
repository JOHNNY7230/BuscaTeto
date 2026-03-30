// No seu arquivo de LOGIN
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que a página recarregue

    // Se o login for bem-sucedido:
    // O comando abaixo "empurra" o usuário para a próxima página
    window.location.href = "dashboard.html";
});