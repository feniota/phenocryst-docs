---
outline: "deep"
next: false
---

# Deployment

In theory, once you put Aphanite in its own folder and grant execution permissions, double-clicking it should run.

However, since Aphanite itself does not implement TLS[^1], and Minecraft requires Yggdrasil servers to implement TLS, you need a reverse proxy[^2] to provide TLS externally.

[^1]: TLS, simply put, is what turns HTTP into HTTPS. Here's [an article from Cloudflare](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/) that explains this technology in simple terms.
[^2]: Here's [an article from Cloudflare](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/) that explains what a reverse proxy is.

Additionally, since all players including the server owner need direct access to Aphanite, if it's running on a local machine, you'll need a tunneling service[^3] to make it accessible from the outside.

[^3]: A tunneling service (also called "port forwarding" or "NAT traversal") creates a secure tunnel from a public server to your local machine, allowing external users to access services running on your local computer. Here's [an article from Cloudflare](https://www.cloudflare.com/learning/network-layer/what-is-tunneling/) explaining it.

This article covers how to get Aphanite running properly.

## Do I Need a Reverse Proxy and/or Tunneling Service?

> [!TIP]
>
> <details><summary>If you're unsure or can't follow the content, you can ask an AI. Here's a prompt we've prepared for you — just copy it to your AI assistant.</summary>
> I'm a person who doesn't know much about computer technology. I'm configuring Aphanite, which is a server program designed for private Minecraft servers. It doesn't support SSL natively, and both my players and I need to access it directly over the internet. To do this, I need to configure a reverse proxy (to implement SSL), and I may also need to configure a tunneling service. Its documentation is at <a href="https://phenocryst.ferris.love/aphanite/deployment">https://phenocryst.ferris.love/aphanite/deployment</a>. The Aphanite developers gave me the following deployment options: Option 1, using a tunneling service with automatic HTTPS (e.g., Cloudflare Tunnel) — this requires a domain on Cloudflare. Option 2, using Nginx as a standalone reverse proxy without tunneling — this requires a server with a public IP or port forwarding, but configuring Nginx may require some technical skill, though server panel products can simplify this. They also mentioned that I might get a free domain from DigitalPlat. Now, please read the documentation at that link, and ask me a few questions to help determine which option I should use (or propose your own new plan). Please start asking me: 1. Where am I deploying Aphanite? (Think about whether my deployment location has a public IP. If details are missing, keep asking.) 2. Do I have my own domain name? 3. (If I have a server) Does my server have a management panel installed? What panel is it? 4. (If I have a server but no panel) Am I comfortable with the command line? If not, am I willing to follow step-by-step instructions? After asking these questions, if there are still missing details, please keep asking me in granular detail. Finally, give me your recommendation and walk me through the configuration step by step. I may not understand some technical terms, so please explain them in simple terms along the way.
> </details>

**TL;DR: Reverse proxy: YES; Tunneling: as needed.**

Note that most tunneling services already include reverse proxy functionality. For the purposes of this document:

- **Tunneling service**: Any tool that can forward ports to the cloud.
- **Reverse proxy**: A tool that only listens on ports locally.

They play different roles in Aphanite:

- Reverse proxy: Wraps Aphanite's "bare" HTTP traffic with TLS, turning it into HTTPS.
  - TLS is mandatory because Minecraft won't accept a "bare" HTTP Yggdrasil server. From a security standpoint, bare HTTP means your communication can be easily tampered with.
- Tunneling: Makes Aphanite accessible on the public internet.
  - This is optional. Question: Does the machine running Aphanite have a dedicated public IP, or a way to map local ports to the internet (typically provided by your server host)? If yes, you don't need a tunneling service.

So the picture is clear — a reverse proxy is required; tunneling is optional.

## How to Configure Reverse Proxy / Tunneling {#port-forwarding}

Below are two approaches you can choose from.

### Cloudflare Tunnel (Reverse Proxy + Tunneling, requires a domain) {#cloudflare-tunnel}

[Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/) is a **free** reverse proxy and tunneling service provided by Cloudflare, the well-known CDN and network infrastructure provider.

**Prerequisite**: A domain name hosted on Cloudflare. If you don't have one, you can also try Cloudflare Quick Tunnel (see below), though each time you restart, your Aphanite server address will change.

#### Steps (with a domain)

1. Log into your Cloudflare account.
2. Click Sidebar → Networking → Tunnels.
3. Click "Create a tunnel" in the top right.
4. Enter any name you like.
5. Follow the on-screen instructions to install and start `cloudflared`.
6. Click "Add Route".
7. Select "Published Applications".
8. Enter the domain you want to deploy to and Aphanite's local URL (relative to the machine running `cloudflared`; typically `http://127.0.0.1:<port>`, where `<port>` is from [Configuration](/aphanite/configuration)).
9. Well done! Your Aphanite should now be accessible at your new domain.

#### Steps (without a domain)

The following uses Cloudflare Quick Tunnels. It assigns a random new domain each time you start, so it's not recommended for permanent use.

1. [Download and install `cloudflared`](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/).
2. Run:
  ```bash
  cloudflared tunnel --url http://localhost:3000
  ```
3. Copy the output domain.
4. Set it as `service.domain` in your config file. (See [Configuration](/aphanite/configuration))
5. Start Aphanite.
6. Your Aphanite should now be accessible at `xxx.trycloudflare.com`.

#### Get a Domain Free of Charge

> [!NOTE]
>
> This method is not tested.

DigitalPlat offers a free domain service, and that should be enough for Minecraft hosting. Check out details [here](https://github.com/DigitalPlatDev/FreeDomain/blob/main/documents/tutorial/getting-started/index.md).

### Nginx (Reverse Proxy only, requires a public IP / port forwarding, requires a domain)

> [!NOTE]
>
> This approach is relatively more difficult to configure. Unless you have special requirements (e.g., you want SSL certificates under your own control), [Cloudflare Tunnel](#cloudflare-tunnel) is recommended.

This section is intended for experienced operators. In short:

1. Obtain an SSL certificate. Use [Certbot](https://certbot.eff.org/) or [acme.sh](https://github.com/acmesh-official/acme.sh).
2. Configure the reverse proxy. Here's a sample Nginx reverse proxy configuration for reference.
```nginx {24}
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  listen 443 quic;
  listen [::]:443 quic;
  http3 on;
  
  server_name aphanite.yourdomain.com;

  ssl_certificate "/etc/letsencrypt/live/yourdomain.com/fullchain.pem";
  ssl_certificate_key "/etc/letsencrypt/live/yourdomain.com/privkey.pem";
  ssl_session_cache shared:SSL:1m;
  ssl_session_timeout 10m;
  ssl_ciphers PROFILE=SYSTEM;
  ssl_prefer_server_ciphers on;
  add_header Alt-Svc 'h3=":443"; ma=86400';
  ssl_early_data on;

  # Load configuration files for the default server block.
  include /etc/nginx/default.d/*.conf;
  
  location / {
    proxy_pass http://127.0.0.1:3000/; # Change this to Aphanite's local listening address.
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 1024M;
  }
}
```
3. `nginx -t && nginx -s reload`.

Alternatively, server management panels like aaPanel or CyberPanel provide one-click reverse proxy configuration — if you have one installed, refer to their documentation.

## Persistent Operation

> [!NOTE]
>
> The following content applies to Linux only.

If you're running Aphanite on a server, you'll likely want it to persist beyond your SSH session. The following guide lets you create a Systemd unit file to manage Aphanite.

These steps are only relevant if you manage your server purely via SSH. If running on a desktop or via a panel, you probably don't need this.

The following assumes your `aphanite` binary is at `/opt/aphanite` and named `aphanite`. Adjust paths according to your setup.

### Creating a User

It's good practice to create a dedicated user for Aphanite to isolate its directory access and prevent accidents.

```bash
sudo useradd -U -d /opt/aphanite -s /sbin/nologin aphanite
sudo chown -R aphanite:aphanite /opt/aphanite
```

### Writing a Systemd Unit File

Here's a sample unit file — modify as needed, paying attention to the service start command.

```ini {11}
[Unit]
Description=Aphanite Yggdrasil server
After=network.target

[Install]
WantedBy=multi-user.target

[Service]
Type=simple
User=aphanite
ExecStart=/opt/aphanite/aphanite --config /opt/aphanite/config.toml --verbose
WorkingDirectory=/opt/aphanite
Restart=on-failure
```

Place your unit file at `/etc/systemd/system/aphanite.service`, then run:

```bash
sudo systemctl daemon-reload
```

Systemd should now be aware of your unit file.

### SELinux Policy

> [!NOTE]
>
> The following may not apply to your distribution. If you encounter errors, consider asking an AI.

If your distribution has SELinux enabled with an aggressive policy, you may need to label the Aphanite binary with `bin_t` for Systemd to start it properly.

Check your SELinux status:

```bash
getenforce
```

If the output is `Enforcing`, you'll likely need the following steps:

```bash
# Remember to replace /opt/aphanite/aphanite with the **absolute** path to Aphanite on your server.
sudo semanage fcontext -a -t bin_t /opt/aphanite/aphanite
sudo restorecon -Rv /opt/aphanite/aphanite
```

### Starting the Service

Finally, use these commands to manage Aphanite:

```bash
sudo systemctl start aphanite       # Start the Aphanite service
sudo systemctl enable aphanite      # Enable Aphanite to start on boot
sudo systemctl enable --now aphanite # Enable on boot and start now
sudo systemctl stop aphanite        # Stop Aphanite
sudo systemctl disable aphanite     # Disable auto-start

systemctl status aphanite           # Check current status
journalctl -u aphanite              # View Aphanite logs
```
