# Running

You need a terminal to run Aphanite.

Aphanite accepts the following command-line arguments:

```
Usage: aphanite [OPTIONS] [COMMAND]

Commands:
  init          Generate and write a configuration file
  create-admin  Create an admin user
  help          Print this message or the help of the given subcommand(s)

Options:
  -v, --verbose          Enable verbose output
      --debug            Enable debug output
  -l, --listen <LISTEN>  The IP address to listen on
  -p, --port <PORT>      The port to listen on
  -c, --config <CONFIG>  Path to configuration file [default: ./config.toml]
  -h, --help             Print help
```

Below are a few notable subcommands.

## Initialize Configuration

Usage:

```bash
./aphanite init --config <path-to-config-file>
```

Running this command generates a fresh configuration file at the specified path (can be omitted). You should have already done this during [Installation](/aphanite/installation#init).

The next step is [Configuration](/aphanite/configuration). You can edit the generated config file as needed.

## Create an Admin User

Usage:

```bash
./aphanite create-admin --email <admin-email> --password <admin-password>
```

This command creates a new admin user in Aphanite.

Generally, you should only use this if you've just installed Aphanite and have no users yet. Otherwise, in the admin panel you'll find more convenient ways to create users.
