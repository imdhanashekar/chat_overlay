
### README.md (English)

# Livestream Chat Overlay

This project provides chat overlays for live streams on the YouTube, Twitch, and Kick platforms. It includes specific scripts for each platform and a proxy server to facilitate integration with YouTube's live chat.

## Table of Contents

- [Installation](#installation)
- [Overlay Configuration](#overlay-configuration)
  - [YouTube](#youtube)
  - [Twitch](#twitch)
  - [Kick](#kick)
- [Accepted Parameters](#accepted-parameters)
  - [General Parameters](#general-parameters)
  - [YouTube Specific Parameters](#youtube-specific-parameters)
  - [Twitch Specific Parameters](#twitch-specific-parameters)
  - [Kick Specific Parameters](#kick-specific-parameters)
- [Generating the Twitch Token](#generating-the-twitch-token)
- [YouTube Livechat Proxy](#youtube-livechat-proxy)

---

## Installation

To get started, follow the steps below:

1. Clone the repository:
   ```sh
   git clone https://github.com/ericknbe/livestream-chat-overlay.git
   ```
2. Navigate to the project directory:
   ```sh
   cd livestream-chat-overlay
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```
4. Start the server:
   ```sh
   npm start
   ```
   The server will be running at `http://localhost:8080`.

---

## Overlay Configuration

### YouTube

To configure the YouTube overlay, add one of the following parameters to the URL:

- **`handle`**: The channel handle (e.g., `@mychannel`).
- **`id`**: The video ID (e.g., `dQw4w9WgXcQ`).
- **`channelId`**: The channel ID (e.g., `UCxxxxxxxxxxxxxxxxxxxxxx`).

**Example:**
```
http://localhost:8080/?handle=@mychannel
```

You will also need a YouTube livechat proxy configured (see the [YouTube Livechat Proxy](#youtube-livechat-proxy) section), or you can use this public proxy: `https://youtube-livechat-proxy.onrender.com/chat` via the `server` parameter.

### Twitch

To configure the Twitch overlay, provide the following parameters in the URL:

- **`twitch`**: The Twitch channel name (e.g., `mychannel`).
- **`token`**: The Twitch authentication token (see [Generating the Twitch Token](#generating-the-twitch-token)).

**Example:**
```
http://localhost:8080/?twitch=mychannel&token=yourtoken
```

### Kick

To configure the Kick overlay, add the following parameter to the URL:

- **`kick`**: The Kick channel name (e.g., `mychannel`).

**Example:**
```
http://localhost:8080/?kick=mychannel
```

---

## Accepted Parameters

### General Parameters

These parameters can be used on all platforms:

- **`hide_commands`**: Hides messages that start with `!` (`true` or `false`). Default: `false`.
  - Example: `?hide_commands=true`
- **`bots`**: Shows or hides bot messages (`true` or `false`). Default: `false`.
  - Example: `?bots=true`
- **`hide_badges`**: Hides user badges (`true` or `false`). Default: `false`.
  - Example: `?hide_badges=true`

### YouTube Specific Parameters

- **`server`**: URL of the livechat proxy server. Default: `localhost:3000/chat`.
  - Example: `?server=https://my-proxy.com/chat`
- **`protocol`**: Protocol of the proxy server (`http` or `https`). Default: `http`.
  - Example: `?protocol=https`
- **`globalEmotes`**: Enables third-party global emotes (`true` or `false`). Default: `true`.
  - Example: `?globalEmotes=false`
- **`progressive`**: Renders messages progressively (`true` or `false`). Default: `true`.
  - Example: `?progressive=false`
- **`showSuperChats`**: Shows Super Chats (`true` or `false`). Default: `true`.
  - Example: `?showSuperChats=false`
- **`showMemberships`**: Shows membership messages (`true` or `false`). Default: `true`.
  - Example: `?showMemberships=false`
- **`showEngagements`**: Shows engagement messages (`true` or `false`). Default: `true`.
  - Example: `?showEngagements=false`

### Twitch Specific Parameters

- **`token`**: Twitch authentication token (required).
  - Example: `?token=yourtoken`
- **`clientId`**: Twitch application client ID. Default: `gp762nuuoqcoxypju8c569th9wz7q5`.
  - Example: `?clientId=yourclientid`

### Kick Specific Parameters

- No additional specific parameters.

---

## Generating the Twitch Token

To use the Twitch overlay, you need an authentication token. Follow the steps below:

1. Go to the [Twitch Token Generator](https://twitchtokengenerator.com/quick/qlLWdZ1RhG).
2. Click on **"Generate Token"**.
3. Authorize access to your Twitch account.
4. Copy the generated token and add it to the URL as the `token` parameter.

**Note:** The default Client ID used in this project is `gp762nuuoqcoxypju8c569th9wz7q5`, provided by the link above, configured with the `chat:read` scope. If you prefer, you can create your own Client ID and token with the necessary scopes (such as `chat:read`) at [Twitch Developer Console](https://dev.twitch.tv/console).

---

## YouTube Livechat Proxy

The YouTube overlay requires a proxy server to communicate with YouTube's live chat API. You can set up your own proxy server using the code and instructions available in the [youtube-livechat-proxy](https://github.com/ericknbe/youtube-livechat-proxy) repository, or you can use the public proxy at `https://youtube-livechat-proxy.onrender.com/chat`.

By default, the script expects the proxy to be at `localhost:3000/chat`, but you can change it using the `server` and `protocol` parameters.

---

### README.md (Português)

# Livestream Chat Overlay

Este projeto fornece overlays de chat para transmissões ao vivo nas plataformas YouTube, Twitch e Kick. Ele inclui scripts específicos para cada plataforma e um servidor proxy para facilitar a integração com o chat ao vivo do YouTube.

## Índice

- [Instalação](#instalação)
- [Configuração do Overlay](#configuração-do-overlay)
  - [YouTube](#youtube)
  - [Twitch](#twitch)
  - [Kick](#kick)
- [Parâmetros Aceitos](#parâmetros-aceitos)
  - [Parâmetros Gerais](#parâmetros-gerais)
  - [Parâmetros Específicos do YouTube](#parâmetros-específicos-do-youtube)
  - [Parâmetros Específicos do Twitch](#parâmetros-específicos-do-twitch)
  - [Parâmetros Específicos do Kick](#parâmetros-específicos-do-kick)
- [Gerando o Token da Twitch](#gerando-o-token-da-twitch)
- [Proxy do Livechat do YouTube](#proxy-do-livechat-do-youtube)

---

## Instalação

Para começar, siga os passos abaixo:

1. Clone o repositório:
   ```sh
   git clone https://github.com/ericknbe/livestream-chat-overlay.git
   ```
2. Navegue até o diretório do projeto:
   ```sh
   cd livestream-chat-overlay
   ```
3. Instale as dependências:
   ```sh
   npm install
   ```
4. Inicie o servidor:
   ```sh
   npm start
   ```
   O servidor estará rodando em `http://localhost:8080`.

---

## Configuração do Overlay

### YouTube

Para configurar o overlay do YouTube, adicione um dos seguintes parâmetros na URL:

- **`handle`**: O handle do canal (ex.: `@meucanal`).
- **`id`**: O ID do vídeo (ex.: `dQw4w9WgXcQ`).
- **`channelId`**: O ID do canal (ex.: `UCxxxxxxxxxxxxxxxxxxxxxx`).

**Exemplo:**
```
http://localhost:8080/?handle=@meucanal
```

Você também precisará de um proxy do livechat do YouTube configurado (veja a seção [Proxy do Livechat do YouTube](#proxy-do-livechat-do-youtube), ou use esse proxy público: ```https://youtube-livechat-proxy.onrender.com/chat``` pelo parametro "server").

### Twitch

Para configurar o overlay do Twitch, forneça os seguintes parâmetros na URL:

- **`twitch`**: O nome do canal Twitch (ex.: `meucanal`).
- **`token`**: O token de autenticação da Twitch (veja [Gerando o Token da Twitch](#gerando-o-token-da-twitch)).

**Exemplo:**
```
http://localhost:8080/?twitch=meucanal&token=seutoken
```

### Kick

Para configurar o overlay do Kick, adicione o seguinte parâmetro na URL:

- **`kick`**: O nome do canal Kick (ex.: `meucanal`).

**Exemplo:**
```
http://localhost:8080/?kick=meucanal
```

---

## Parâmetros Aceitos

### Parâmetros Gerais

Esses parâmetros podem ser usados em todas as plataformas:

- **`hide_commands`**: Oculta mensagens que começam com `!` (`true` ou `false`). Padrão: `false`.
  - Exemplo: `?hide_commands=true`
- **`bots`**: Mostra ou oculta mensagens de bots (`true` ou `false`). Padrão: `false`.
  - Exemplo: `?bots=true`
- **`hide_badges`**: Oculta badges dos usuários (`true` ou `false`). Padrão: `false`.
  - Exemplo: `?hide_badges=true`

### Parâmetros Específicos do YouTube

- **`server`**: URL do servidor proxy do livechat. Padrão: `localhost:3000/chat`.
  - Exemplo: `?server=https://meu-proxy.com/chat`
- **`protocol`**: Protocolo do servidor proxy (`http` ou `https`). Padrão: `http`.
  - Exemplo: `?protocol=https`
- **`globalEmotes`**: Habilita emotes globais de terceiros (`true` ou `false`). Padrão: `true`.
  - Exemplo: `?globalEmotes=false`
- **`progressive`**: Renderiza mensagens progressivamente (`true` ou `false`). Padrão: `true`.
  - Exemplo: `?progressive=false`
- **`showSuperChats`**: Mostra Super Chats (`true` ou `false`). Padrão: `true`.
  - Exemplo: `?showSuperChats=false`
- **`showMemberships`**: Mostra mensagens de membros (`true` ou `false`). Padrão: `true`.
  - Exemplo: `?showMemberships=false`
- **`showEngagements`**: Mostra mensagens de engajamento (`true` ou `false`). Padrão: `true`.
  - Exemplo: `?showEngagements=false`

### Parâmetros Específicos do Twitch

- **`token`**: Token de autenticação da Twitch (obrigatório).
  - Exemplo: `?token=seutoken`
- **`clientId`**: Client ID da aplicação Twitch. Padrão: `gp762nuuoqcoxypju8c569th9wz7q5`.
  - Exemplo: `?clientId=seuclientid`

### Parâmetros Específicos do Kick

- Nenhum parâmetro adicional específico.

---

## Gerando o Token da Twitch

Para usar o overlay do Twitch, você precisa de um token de autenticação. Siga os passos abaixo:

1. Acesse o [Twitch Token Generator](https://twitchtokengenerator.com/quick/qlLWdZ1RhG).
2. Clique em **"Generate Token"**.
3. Autorize o acesso à sua conta Twitch.
4. Copie o token gerado e adicione-o à URL como o parâmetro `token`.

**Nota:** O Client ID padrão usado neste projeto é `gp762nuuoqcoxypju8c569th9wz7q5`, fornecido pelo link acima, configurado com o scope `chat:read`. Se preferir, você pode criar seu próprio Client ID e token com os scopes necessários (como `chat:read`) em [Twitch Developer Console](https://dev.twitch.tv/console).

---

## Proxy do Livechat do YouTube

O overlay do YouTube requer um servidor proxy para se comunicar com a API de chat ao vivo do YouTube. O código e as instruções de configuração estão disponíveis no repositório [youtube-livechat-proxy](https://github.com/ericknbe/youtube-livechat-proxy). Siga as instruções no repositório para configurá-lo, ou use esse proxy público: ```https://youtube-livechat-proxy.onrender.com/chat``` pelo parametro "server").

Por padrão, o script espera que o proxy esteja em `localhost:3000/chat`, mas você pode alterá-lo usando os parâmetros `server` e `protocol`.

---