# 🚀 Guia de Deploy no DigitalOcean

Este guia passo a passo ajudará você a colocar o **CivicGit** no ar usando um servidor VPS (Droplet) do DigitalOcean.

## 1. Criar o Droplet (Servidor Virtual)

1.  Acesse sua conta no [DigitalOcean](https://cloud.digitalocean.com/).
2.  Clique em **Create** -> **Droplets**.
3.  **Region**: Escolha a mais próxima (ex: New York ou San Francisco).
4.  **OS Image**: Escolha **Ubuntu 24.04 LTS** (ou 22.04).
5.  **Droplet Type**: Basic.
6.  **CPU Options**: Regular.
7.  **Price**: O plano de **$6/mês** (1GB RAM) pode ser pouco para o "build" do frontend. Recomendo temporariamente o de **$12/mês** (2GB RAM) ou ativar **Swap** (o script pode falhar por falta de memória no build se for 1GB).
8.  **Authentication**: Escolha **SSH Key** (mais seguro) ou **Password** (mais fácil).
9.  Clique em **Create Droplet**.

## 2. Acessar o Servidor

Abra seu terminal (PowerShell ou CMD no Windows) e conecte-se:

```bash
ssh root@SEU_IP_DO_DROPLET
# Exemplo: ssh root@142.93.123.45
```
(Se usou senha, digite a senha quando pedir).

## 3. Preparar e Instalar

Uma vez dentro do servidor, siga os passos:

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/dionatandiego11/pdt-itaguara.git
cd pdt-itaguara
```

### Passo 2: Executar o Script de Instalação
Criei um script automático (`deploy/setup_vps.sh`) que instala Docker, Nginx, Node.js e configura tudo.

Primeiro, dê permissão de execução:
```bash
chmod +x deploy/setup_vps.sh
```

Agora, rode o script:
```bash
./deploy/setup_vps.sh
```

⏳ **Aguarde...** O script vai demorar alguns minutos pois ele irá:
1.  Atualizar o sistema.
2.  Instalar Docker e Node.js.
3.  Subir o Banco de Dados e API.
4.  Compilar o Frontend (React).
5.  Configurar o Nginx para servir o site.

### Passo 3: Testar

Quando o script terminar, abra seu navegador e digite o IP do seu Droplet:

`http://SEU_IP_DO_DROPLET`

Você deve ver o CivicGit rodando! 🎉

---

## 🔧 Configurações Adicionais (Pós-Instalação)

### Domínio e HTTPS (Cadeado de Segurança)
Para colocar um domínio (ex: `seusite.com`) e HTTPS:

1.  Aponte o DNS do seu domínio (Tipo A) para o IP do Droplet.
2.  No servidor, instale o Certbot:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    ```
3.  Edite o arquivo `/etc/nginx/sites-available/civicgit` e troque `server_name _;` por `server_name seusite.com;`.
4.  Rode o Certbot:
    ```bash
    sudo certbot --nginx -d seusite.com
    ```

### Atualizando o Sistema
Se você fizer mudanças no código e quiser atualizar o servidor:

```bash
cd pdt-itaguara
git pull
./deploy/setup_vps.sh
```
(O script é seguro para rodar várias vezes, ele reconstrói o que for necessário).
