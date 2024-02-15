# multissh.github.io

![Website](https://img.shields.io/website?url=https%3A%2F%2Fmultissh.github.io&up_message=online&down_message=offline&logo=googlechrome&label=demo%20website)
![GitHub](https://img.shields.io/github/license/multissh/multissh.github.io)

MultiSSH is a webtool that allows you to manage multiple SSH connections simultaneously. Free Multi SSH client for Desktop and Mobile.

## Features

- **Manage multiple SSH connections**: Easily handle multiple SSH connections simultaneously, making it ideal for managing a fleet of servers.
- **Easy to use interface**: The intuitive interface saves you time when managing your servers. No need to remember complex command lines.
- **Secure and efficient**: Uses the secure SSH protocol to ensure your connections are safe. Optimized for efficiency to handle multiple connections without slowing down.
- **Parallel Interaction**: Connect to multiple hosts over SSH and interact with them in parallel. Execute commands on multiple servers at once.
- **Snippets**: Frequently used shell commands can be added as Snippets. This allows you to execute common tasks on multiple hosts with a single click.
- **Integrated Text Editor**: Comes with a basic text editor that lets you create, edit, and update files directly from the client. No need to switch between different applications.

## How to Use

Follow these steps to get started with MultiSSH:

### Sign In

1. Visit [multissh.github.io](https://multissh.github.io).
2. Click on the "Sign In" button.
3. Enter your username and key:
    - Username: `demo`
    - Key: `dTAu1iOvOfxQ63BZsYQpDqvyHMjeD8itjZ7GTs`
4. Click on the "Sign In" button to log in.

### Add Server
![Server Setup](https://i.imgur.com/B1625qm.png)

1. After signing in, click on the "Server" button.
2. Enter your token and the URL of your server list:
    - Token: `ghp_xxxxxx`
    - URL: `https://raw.githubusercontent.com/multissh/repo/main/multissh/server.txt`
3. Click on the "Save" button to add the server.

### Server Configuration Format
The `server.txt` file is used to configure the servers that the application will connect to. Each server is represented by one or more lines in the file. 

server.txt format:

```txt
# [Server Name]
[username]:[password]||[ip address]:[port]
```

Here's an example configuration:
```
# vps1
root:xxxxx||127.0.0.1:22
root:xxxxx||127.0.0.1:22

# vps2
root:xxxxx||127.0.0.1:22
```

In this example, the application will connect to three servers. The first two servers are grouped under the name "vps1", and the third server is named "vps2". All servers use the username "root" and the password "password123" for authentication. just create on your private repos

### Add Snippet
![Snippet Setup](https://i.imgur.com/8aPvKor.png)

1. Click on the "Snippet" button.
2. Enter your token and the URL of your snippet:
    - Token: `ghp_xxxxxx`
    - URL: `https://raw.githubusercontent.com/multissh/repo/main/multissh/snippets.sh`
3. Click on the "Save" button to add the snippet.

### snippets.sh Format
The `snippets.sh` file is used to define the snippets that the application will execute. Each snippet is represented by one or more lines in the file.

snippets.sh format :
```sh
# [Snippet Name]
[Command]
```
example configuration with two snippets:
```sh
# uptime
uptime

# check screen
screen -ls
```
Please note that the actual commands you can use depend on the server's operating system and the installed software. Make sure to test your snippets before adding them to the snippets.sh file.

Now you're ready to start using MultiSSH!

## Acknowledgments

Thank anyone who has contributed to the project, or other sources of inspiration or code.

## Get Involved

We'd love for you to try out MultiSSH and give us your feedback. If you're a developer, we'd also appreciate any contributions to the codebase.
