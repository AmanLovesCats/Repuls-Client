# Repuls Client
🎮️ [Repuls.io](https://repuls.io) is a free game accessible from any browser or on your favorite gaming sites like Poki! You can play it without downloading, without an account, without paying, anywhere, and with the guarantee of unforgettable matches with your friends. Looking for dynamic, multiplayer gameplay? In Repuls, you ride motorcycles, climb cliffs, dominate the opposing team with sniper, pilot Guardian hovercrafts, fire plasma rifles, miniguns, or rocket launchers, and stomp vehicles with a giant mech!

⭐️ This client is here while we wait for the official client **to offer you slightly better performance than your usual browser** and **add a few features** (details below). To download it, go to [the releases page](https://github.com/AmanLovesCats/Repuls-Client/releases). Changelog is [here](#changelog). You can first check the files with an antivirus if you wish, there's not a lot in here anyway. Enjoy!

> [!NOTE]
> The client is available on Windows. To use the client on a Unix system, or to report any security issues, please use the GitHub issues or contact me (AmanLovesCats) directly on Discord (*`aman_and_cats`*).

> [!CAUTION]
> [Repuls.io](https://repuls.io) is a game developed by [docski](https://github.com/tahirG?tab=sponsoring). THIS IS AN UNOFFICIAL CLIENT NOT AFFILIATED TO DOCSKI.

Inspired by [NeXiDE's NeXi-Client](https://github.com/NeXi-Client/NeXi-Client). Created by AmanLovesCats.

## Details of the client
### Main features
#### Improves performance
- Boosts FPS a bit more than your browser
- Uses your CPU and GPU for rendering
- Implements different flags client sided to increase performance.
- Delayed opening and disabled frame rate limit.
#### Improves the user experience
- Supports higher DPI than normal browser.
- Allows almost any size of monitor to run the game.
- Includes Discord RPC.
- *Opens links in your default browser.*

### Commands (built-in shortcuts)
- <kbd>F1</kbd> Reload
- <kbd>Ctrl+F1</kbd> Reload client with Full reset
- <kbd>Ctrl+F5</kbd> Reload with cache removal
- <kbd>F6</kbd> Enable/Disable Game joins
- <kbd>F9</kbd> Copy Invite Link to game
- <kbd>F11</kbd> Fullscreen
- <kbd>F12</kbd> Copy your ID to get your statistics via the Discord bot associated with the client.

## Changelog
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![GitHub Release](https://img.shields.io/github/v/release/AmanLovesCats/Repuls-Client?include_prereleases&style=flat&logo=auto&color=blue&link=https%3A%2F%2Fgithub.com%2Fpandaroux007%RepulsBot%2Freleases)

## Supported Versions
| Version  |      Supported     |
| -------  | ------------------ |
| 1.21.3   | :white_check_mark: |
| 1.21.2   | :white_check_mark: |
| 1.21.1   | :white_check_mark: |
| < 1.21.0 |      :x:           |

### v1.21.3
> This new version comes with extra features to bump the purpose of a client. Yes it still has performance upgrades but it has been noticed that these upgrades may vary from user to user, in my case the FPS has an increment of almost 50-60 frames.

#### Fix
- Google login support was improved, there is an attempt to force webGPU but it most likely won't work, that's about it.

#### New Features:
- ***Dynamic Discord RPC***: The Discord RPC now tells whether you are in the lobby, in a game or even in the store browsing or buying. Users can join you directly from your profile by clicking Join Game button. In case you have too many stalkers or don't want people to be able to join your game, you can press <kbd>F6</kbd> to disable/enable the Join Game Button (thanks fuunara).

- ***Dynamic Join Links***: In case you want to invite someone to your game and don't have joins on, then you can press F9 to immediately copy a dynamic invite link ready for discord, simply paste it in discord and the user can join from there.

- ***Personal Special Stats***: There are stats on our profiles that we don't know about, like our account creation date, our preferred weapons and the number of eliminations with each, our longest win streak, etc. This update brings a Discord bot and client binding allowing you to automatically view your account statistics at any time directly on Discord (use <kbd>F12</kbd> to copy your ID and use it with the bot). This can be used to flex too lol.

### v1.20.5
- Google support added

### v1.20.9
- Auto-updates added