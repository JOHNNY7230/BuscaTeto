using System;
using BuscaTeto.Data;
using BuscaTeto.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// Força a API a escutar numa porta HTTP específica e limpa
builder.WebHost.UseUrls("http://localhost:5005");

// ========================================================
// 1. CONFIGURAÇÃO DE SERVIÇOS (O "Motor" do C#)
// ========================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Ativa a leitura dos seus arquivos dentro da pasta Controllers!
builder.Services.AddControllers();

// Injeção de Dependência: Ensina o C# a usar o nosso novo Repositório
builder.Services.AddScoped<IRepositorioImovel, RepositorioImovel>();

// Configuração do Banco de Dados MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        new MySqlServerVersion(new Version(8, 0, 30)),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null
        )
    ));

// Configuração de CORS (Permite que o seu HTML converse com a API sem bloqueios)
builder.Services.AddCors(options => {
    options.AddDefaultPolicy(policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// ========================================================
// 2. CONSTRUÇÃO DO APP E MIDDLEWARES
// ========================================================
var app = builder.Build();

app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

// Configura o login.html como a página inicial padrão do sistema
var options = new DefaultFilesOptions();
options.DefaultFileNames.Clear();
options.DefaultFileNames.Add("login.html");
app.UseDefaultFiles(options);

// Permite ler arquivos de front-end da pasta wwwroot (HTML, CSS, JS)
app.UseStaticFiles();

// Redireciona a raiz direto para o login
app.MapGet("/", () => Results.Redirect("/login.html"));

// 🔥 ESSENCIAL: Mapeia as rotas de TODOS os seus Controllers (Usuarios e Imoveis)
app.MapControllers();

// Inicia o servidor
app.Run();