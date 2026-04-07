document.getElementById('formCadastro').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede a página de recarregar

    // Capturando os valores dos campos
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('senha').value;

    // Criando o objeto para enviar ao C#
    const dadosUsuario = {
        nome: nome,
        email: email,
        telefone: telefone,
        senha: senha
    };

    try {
        // Substitua 'api/usuarios/registrar' pela sua rota real do Controller C#
        const response = await fetch('http://localhost:5000/api/usuarios/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosUsuario)
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'login.html'; // Redireciona para o login
        } else {
            alert('Erro ao cadastrar. Verifique os dados.');
        }
    } catch (error) {
        console.error('Erro na conexão:', error);
        alert('Erro ao conectar com o servidor.');
    }
});