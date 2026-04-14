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

        const usuario = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: inputTelefone.value,
            senha: document.getElementById('senha').value
        };

        // Validações básicas antes de enviar
        if (!validarEmail(usuario.email)) {
            alert('E-mail inválido!');
            return;
        }

        try {
            const response = await fetch('/usuarios', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                // Redireciona direto passando um "aviso" na URL
                window.location.href = 'index.html?cadastrado=true';
            } else {
                const erroTexto = await response.text();
                alert('Erro ao cadastrar: ' + erroTexto);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor.');
        }
    });
});