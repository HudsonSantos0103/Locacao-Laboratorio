# 🏫 Sistema de Gestão Escolar Integrado

[![Licença](https://img.shields.io/badge/license-MIT-green)](https://opensource.org/licenses/MIT)
[![Versão](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/)
[![JS](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)

O **Sistema de Gestão Escolar Integrado** é uma aplicação web completa voltada para a organização de recursos e pessoal em instituições de ensino. O projeto centraliza o agendamento de laboratórios técnicos e a gestão de escalas de monitoria em uma interface intuitiva e responsiva.

Link: 

https://hudsonsantos0103.github.io/Locacao-Laboratorio/


## 🚀 Funcionalidades

### 🔐 Segurança e Acesso
- **Módulo de Autenticação:** Sistema de login e cadastro persistente.
- **Perfis de Usuário:** Diferenciação entre professores e coordenadores.
- **Proteção de Rotas:** Bloqueio de acesso às funcionalidades sem login prévio.

### 🧪 Reserva de Laboratórios
- **Multi-Laboratórios:** Gestão para Lab de Informática, Hardware e Multimídia.
- **Filtro Calendário:** Organização por 4 semanas letivas e dias da semana.
- **Regras de Negócio:** Validação de turmas autorizadas (DS, MULTI, CTB, RDC) e bloqueio automático de horários de almoço.

### 📋 Escala de Monitoria
- **Controle de Postos:** Gerenciamento de alunos em locais como Portaria, Refeitório e Filas de Intervalo.
- **Distribuição por Turno:** Organização clara de quem está em cada posto durante os intervalos da manhã, almoço e tarde.

## 🛠️ Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando o conceito de **Vanilla Web Development**, priorizando performance e sem dependências externas:

- **HTML5:** Estruturação semântica e acessível.
- **CSS3:** Estilização moderna com Variáveis CSS, Flexbox e animações `@keyframes`.
- **JavaScript (ES6+):** Lógica reativa, manipulação de DOM e gestão de estado.
- **LocalStorage:** Persistência de dados local (simulação de banco de dados).



## 📂 Estrutura do Repositório

```text
├── index.html      # Estrutura das seções (Login, Menu, Reservas, Monitoria)
├── index.css       # Identidade visual, cores (Paleta Verde Escolar) e transições
├── index.js        # Core do sistema: Autenticação, Persistência e Renderização
└── README.md       # Documentação técnica
