using System;
using System.Linq;
using BuscaTeto.Models;
using BuscaTeto.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// Força o Kestrel a rodar em uma porta HTTP limpa para evitar bloqueios do Windows
builder.WebHost.UseUrls("http://localhost:5005");

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração do MySQL estável sem usar AutoDetect no boot
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 30)))
);

builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

// Arquivos estáticos do frontend chamados apenas uma vez
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/", () => Results.Redirect("/index.html"));

// --- ROTAS DE IMÓVEIS ---

// Buscar imóveis incluindo a tabela relacional de Endereço e Usuário
app.MapGet("/imoveis", async (AppDbContext db, string? cidade, decimal? precoMin, decimal? precoMax, int? quartosMin) =>
{
    var query = db.Imoveis
        .Include(i => i.Endereco)
        .Include(i => i.Usuario)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(cidade))
        query = query.Where(i => i.Endereco != null && i.Endereco.Cidade.Contains(cidade));
    if (precoMin.HasValue)
        query = query.Where(i => i.Preco >= precoMin.Value);
    if (precoMax.HasValue)
        query = query.Where(i => i.Preco <= precoMax.Value);
    if (quartosMin.HasValue)
        query = query.Where(i => i.Quartos >= quartosMin.Value);

    var resultados = await query.ToListAsync();
    return Results.Ok(resultados);
});

// Buscar imóvel único por ID
app.MapGet("/imoveis/{id}", async (AppDbContext db, Guid id) =>
{
    var imovel = await db.Imoveis
        .Include(i => i.Endereco)
        .Include(i => i.Usuario)
        .FirstOrDefaultAsync(i => i.Id == id);

    return imovel is null ? Results.NotFound() : Results.Ok(imovel);
});

// Cadastrar imóvel salvando primeiro na tabela Enderecos
app.MapPost("/imoveis", async (AppDbContext db, CriarImovelRequest criar) =>
{
    var usuarioExiste = await db.Usuarios.AnyAsync(u => u.Id == criar.UsuarioId);
    if (!usuarioExiste) return Results.BadRequest("O usuário especificado não existe.");

    // 1. Instancia e salva o endereço baseado no record aninhado
    var novoEndereco = new Endereco
    {
        Id = Guid.NewGuid(),
        Logradouro = criar.Endereco.Logradouro,
        Numero = criar.Endereco.Numero,
        Bairro = criar.Endereco.Bairro,
        Cidade = criar.Endereco.Cidade,
        Estado = criar.Endereco.Estado,
        CEP = criar.Endereco.CEP
    };
    db.Enderecos.Add(novoEndereco);

    // 2. Cria o imóvel apontando para a FK do endereço gerado acima
    var novoImovel = new Imovel
    {
        Id = Guid.NewGuid(),
        Titulo = criar.Titulo,
        Descricao = criar.Descricao,
        Preco = criar.Preco,
        Quartos = criar.Quartos,
        Imagem = criar.Imagem,
        UsuarioId = criar.UsuarioId,
        EnderecoId = novoEndereco.Id,
        CriadoEm = DateTime.UtcNow
    };
    db.Imoveis.Add(novoImovel);

    await db.SaveChangesAsync();

    var resposta = await db.Imoveis
        .Include(i => i.Endereco)
        .FirstOrDefaultAsync(i => i.Id == novoImovel.Id);

    return Results.Created($"/imoveis/{novoImovel.Id}", resposta);
});

// Atualizar Imóvel
app.MapPut("/imoveis/{id}", async (AppDbContext db, Guid id, AtualizarImovelRequest atualizar) =>
{
    var imovel = await db.Imoveis.FindAsync(id);
    if (imovel is null) return Results.NotFound();

    if (atualizar.Titulo != null) imovel.Titulo = atualizar.Titulo;
    if (atualizar.Descricao != null) imovel.Descricao = atualizar.Descricao;
    if (atualizar.Preco.HasValue) imovel.Preco = atualizar.Preco.Value;
    if (atualizar.Quartos.HasValue) imovel.Quartos = atualizar.Quartos.Value;
    if (atualizar.Imagem != null) imovel.Imagem = atualizar.Imagem;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

// --- ROTAS DE USUÁRIOS ---

app.MapGet("/usuarios", async (AppDbContext db) =>
{
    var usuarios = await db.Usuarios.ToListAsync();
    return Results.Ok(usuarios);
});

app.MapGet("/usuarios/{id}", async (AppDbContext db, Guid id) =>
{
    var usuario = await db.Usuarios.FindAsync(id);
    return usuario is null ? Results.NotFound() : Results.Ok(usuario);
});

app.MapPost("/usuarios", async (AppDbContext db, CriarUsuarioRequest criar) =>
{
    var criado = new Usuario
    {
        Id = Guid.NewGuid(),
        Nome = criar.Nome,
        Email = criar.Email,
        Senha = criar.Senha,
        Telefone = criar.Telefone,
        CriadoEm = DateTime.UtcNow
    };

    db.Usuarios.Add(criado);
    await db.SaveChangesAsync();

    return Results.Created($"/usuarios/{criado.Id}", criado);
});

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