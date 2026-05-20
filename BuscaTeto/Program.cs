using System;
using System.Linq;
using BuscaTeto.Repositories;
using BuscaTeto.Models;
using BuscaTeto.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// Força a API a escutar numa porta HTTP específica e limpa, contornando bloqueios do Windows
builder.WebHost.UseUrls("http://localhost:5005");

// 1. Adicionar os serviços do Swagger 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração da Base de Dados (Entity Framework Core com MySQL)
// Definimos a versão manualmente para evitar que o AutoDetect quebre o arranque da aplicação
// Configuração da Base de Dados (Entity Framework Core com MySQL) atualizada com Resiliência
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 30)), // Versão padrão estável do MySQL
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,               // Tenta reconectar até 5 vezes se a rede oscilar
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null
        )
    ));

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

// 2. Ativar a interface visual do Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Serve ficheiros estáticos na pasta wwwroot (Corrigido: registado apenas uma vez)
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/", () => Results.Redirect("/index.html"));

// Buscar um único imóvel pelo ID
app.MapGet("/imoveis", async (AppDbContext db, string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin) =>
{
    // O .Include traz os dados da tabela Enderecos junto com o Imovel
    var query = db.Imoveis.Include(i => i.Endereco).AsQueryable();

    if (!string.IsNullOrWhiteSpace(cidade))
        query = query.Where(i => i.Endereco.Cidade.Contains(cidade)); // Buscando da tabela relacionada
    if (precoMin.HasValue)
        query = query.Where(i => i.Preco >= precoMin.Value);
    if (precoMax.HasValue)
        query = query.Where(i => i.Preco <= precoMax.Value);
    if (quartosMin.HasValue)
        query = query.Where(i => i.Quartos >= quartosMin.Value);

    var resultados = await query.ToListAsync();
    return Results.Ok(resultados);
});

// Guardar um novo imóvel na Base de Dados
app.MapPost("/imoveis", async (AppDbContext db, CriarImovelRequest criar) =>
{
    var novoEnderecoId = Guid.NewGuid();

    var criado = new Imovel
    {
        Id = Guid.NewGuid(),
        Titulo = criar.Titulo,
        Descricao = criar.Descricao,
        Preco = criar.Preco,
        Quartos = criar.Quartos,
        Imagem = criar.Imagem,
        UsuarioId = criar.UsuarioId,
        CriadoEm = DateTime.UtcNow,

        // Vincula e cria o endereço automaticamente na tabela Enderecos
        EnderecoId = novoEnderecoId,
        Endereco = new Endereco
        {
            Id = novoEnderecoId,
            Logradouro = criar.Logradouro,
            Numero = criar.Numero,
            Bairro = criar.Bairro,
            Cidade = criar.Cidade,
            CEP = criar.CEP
        }
    };

    db.Imoveis.Add(criado);
    await db.SaveChangesAsync(); // O EF grava o endereço e o imóvel respeitando a FK!

    return Results.Created($"/imoveis/{criado.Id}", criado);
});

// Atualizar um imóvel existente
app.MapPut("/imoveis/{id}", async (AppDbContext db, Guid id, AtualizarImovelRequest atualizar) =>
{
    // Carrega o imóvel trazendo o endereço junto
    var imovel = await db.Imoveis.Include(i => i.Endereco).FirstOrDefaultAsync(i => i.Id == id);
    if (imovel is null) return Results.NotFound();

    if (atualizar.Titulo != null) imovel.Titulo = atualizar.Titulo;
    if (atualizar.Descricao != null) imovel.Descricao = atualizar.Descricao;
    
    // Atualiza a cidade dentro do objeto de Endereço vinculado
    if (atualizar.Cidade != null && imovel.Endereco != null) 
        imovel.Endereco.Cidade = atualizar.Cidade;

    if (atualizar.Preco != null) imovel.Preco = atualizar.Preco.Value;
    if (atualizar.Quartos != null) imovel.Quartos = atualizar.Quartos.Value;
    if (atualizar.Imagem != null) imovel.Imagem = atualizar.Imagem;

    await db.SaveChangesAsync(); 
    return Results.NoContent();
});

// Buscar todos os utilizadores
app.MapGet("/usuarios", async (AppDbContext db) =>
{
    var usuarios = await db.Usuarios.ToListAsync();
    return Results.Ok(usuarios);
});

// Buscar um único utilizador pelo ID
app.MapGet("/usuarios/{id}", async (AppDbContext db, Guid id) =>
{
    var usuario = await db.Usuarios.FindAsync(id);
    return usuario is null ? Results.NotFound() : Results.Ok(usuario);
});

// Guardar um novo utilizador na Base de Dados
app.MapPost("/usuarios", async (AppDbContext db, CriarUsuarioRequest criar) =>
{
    var criado = new Usuario
    {
        // Remova a linha do Id! O MySQL vai gerar o número 1, 2, 3... sozinho por causa do AUTO_INCREMENT
        Nome = criar.Nome,
        Email = criar.Email,
        Senha = criar.Senha,
        Telefone = criar.Telefone,
        TipoUsuario = criar.TipoUsuario // 👈 Adicionamos o campo novo que veio do Front!
    };

    db.Usuarios.Add(criado);
    await db.SaveChangesAsync();

    return Results.Created($"/usuarios/{criado.Id}", criado);
});

// Atualizar um utilizador existente
app.MapPut("/usuarios/{id}", async (AppDbContext db, Guid id, AtualizarUsuarioRequest atualizar) =>
{
    var usuario = await db.Usuarios.FindAsync(id);
    if (usuario is null) return Results.NotFound();

    if (atualizar.Nome != null) usuario.Nome = atualizar.Nome;
    if (atualizar.Email != null) usuario.Email = atualizar.Email;
    if (atualizar.Senha != null) usuario.Senha = atualizar.Senha;
    if (atualizar.Telefone != null) usuario.Telefone = atualizar.Telefone;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

// Define a estrutura exata que o endpoint POST /imoveis espera receber do JavaScript
public record CriarImovelRequest(
    string Titulo,
    string? Descricao,
    decimal Preco,
    int Quartos,
    string? Imagem,
    Guid UsuarioId,
    string Logradouro,
    string? Numero,
    string? Bairro,
    string Cidade,
    string CEP
);

// Mantém os outros records de suporte abaixo, caso existam
public record AtualizarImovelRequest(string? Titulo, string? Descricao, string? Cidade, decimal? Preco, int? Quartos, string? Imagem);
public record CriarUsuarioRequest(string Nome, string Email, string Senha, string Telefone);
public record AtualizarUsuarioRequest(string? Nome, string? Email, string? Senha, string? Telefone);