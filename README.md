<h1 align="center">The V - Once Human discord bot</h1>
<p align="center">
  <img
    alt="Repository size"
    src="https://img.shields.io/github/repo-size/duartejbrito/oh-v-bot-2"
  />
 <a href="https://www.linkedin.com/in/duartebrito/">
    <img
      alt="Made by Duarte Brito"
      src="https://img.shields.io/badge/made%20by-Duarte%20Brito-%2304D361"
    />
  </a>
  <a href="https://github.com/duartejbrito/oh-v-bot-2/commits/main">
    <img
      alt="GitHub last commit"
      src="https://img.shields.io/github/last-commit/duartejbrito/oh-v-bot-2"
    />
  </a>
  <img
    alt="License"
    src="https://img.shields.io/badge/license-MIT-brightgreen"
  />
  <a href="https://github.com/duartejbrito/oh-v-bot-2/stargazers">
    <img
      alt="Stargazers"
      src="https://img.shields.io/github/stars/duartejbrito/oh-v-bot-2?style=social"
    />
  </a>
</p>

<p align="center">
  <a href="#-project">Project</a> |
  <a href="#-commands-for-managing-notification-channels">Commands</a> |
  <a href="#-how-to-contribute">How to contribute</a> |
  <a href="#-license">License</a>
</p>

## 💻 Project

The V - Once Human Discord Bot is a versatile tool designed to manage and provide alerts for crate and cargo events in the Once Human game. It features commands for setting up notification channels, roles, and auto-delete options, ensuring players stay informed about important in-game events.

To add bot click [here](https://discord.com/oauth2/authorize?client_id=1284580273626943661&scope=applications.commands%20bot)

## 📢 Commands for Managing Notification Channels

The available commands for managing notification channels in the V - Once Human Discord Bot are:

### Crate Command ([src/commands/crate.ts](src/commands/crate.ts))

**Setup**: `/crate setup`

**Options**:

- `channel`: The text/announcement channel for notifications (required).
- `role`: The role to mention in the alert (optional).
- `auto-delete`: Toggle auto-delete for alerts before the next post (optional).
- `mute`: Toggle mute for notifications (optional).

### Cargo Command ([src/commands/cargo.ts](src/commands/cargo.ts))

**Setup**: `/cargo setup`

**Options**:

- `channel`: The text/announcement channel for notifications (required).
- `role`: The role to mention in the alert (optional).
- `auto-delete`: Toggle auto-delete for alerts before the next post (optional).
- `mute`: Toggle mute for notifications (optional).

### Info Command ([src/commands/info.ts](src/commands/info.ts))

**Usage**: `/info`

Provides information about the current settings for crate and cargo notifications.

### Next Command ([src/commands/next.ts](src/commands/next.ts))

**Usage**: `/next`

Displays the next scheduled crate or cargo event.

### Remove Command ([src/commands/remove.ts](src/commands/remove.ts))

**Usage**: `/remove`

Removes the current settings for crate and cargo notifications.

These commands allow you to set up notification channels, roles, and auto-delete options for crate and cargo events in the Once Human game.

## 🤔 How to contribute

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name> `.
3. Make your changes and commit them: `git commit -m '<commit_message> '`
4. Push to original branch:`git push origin <project_name> / <local>`
5. Create the pull request. Or, see the GitHub documentation on [how to create a pull request][pr].

## 📝 License

This project is under the MIT license. See the [LICENSE](https://github.com/duartejbrito/oh-v-bot-2/blob/main/LICENSE.md) for details.

Made with ♥ by Duarte Brito 👋 [Get in touch!](https://www.linkedin.com/in/duartebrito/)

[pr]: https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request
[git]: https://git-scm.com
[node]: https://nodejs.org/
[ts]: https://www.typescriptlang.org/
[discord.js]: https://discord.js.org/
[eslint]: https://eslint.org/
[prettier]: https://prettier.io/
