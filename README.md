# abs-watcher

## What is ABS Watcher?

This small Node CLI app is an external library watcher for Audiobookshelf (a.k.a ABS).

It's intended for use on Windows, alongside ABS Windows Docker installations.

### What is a watcher?

A watcher is a software that watches file system directories and files for changes.

ABS has library watchers that watch the ABS library folders for changes.

For example, if you move some new audiobook files to one of the library folders, ABS will automatically get notified of the new files by the library watcher, and it will add them to the library.

### Why do I need ABS Watcher?

If you installed Audiobookshelf on Windows as a Docker container (by following this [guide](https://www.audiobookshelf.org/guides/docker-install)), you might find out that your library watchers are not working as intended, and that ABS does not get notified when changes happens in one of your libraries.

### Why are the internal Audiobookshelf watchers not working?

In most cases, Docker Desktop on Windows is installed on WSL (Windows Subsystem for Linux) 2.

This means that your Docker containers run on an isloated Linux virtual machine, so by default they cannot see your Windows drives and folders. In order to make Windows folders visible to your docker container, you define them as Docker volumes.

These can be defined, for example, in the Docker Compose configuration (as explained in the ABS Windows installation guide), like this:

```sh
version: "3.7"
services:
  audiobookshelf:
    image: ghcr.io/advplyr/audiobookshelf:latest
    ports:
      - 13378:80
    volumes:
      - F:\Audiobooks:/audiobooks
      - F:\Audiobookshelf\config:/config
      - F:\Audiobookshelf\metadara:/metadata
```

In the example above, /audiobooks is defined as a volume that maps to the Windows folder F:\audiobooks.

This way, you can create an ABS library that points to the /audiobooks folder, which maps to F:\audiobooks where all your books are kept. ABS can access, read, and write to this folder like every other folder.

Watching for changes, however, will not work in most cases, because it relies on notifications from the operating system hosting the watched folder (Windows, in our case), and those notifications are not passed from Windows to WSL 2.

So, in our example, any changes made to F:\audiobooks by any Windows application, will not be visible to the ABS library watcher (running on WSL 2).

To fix this issue, you need to run ABS Watcher on your Windows system.

### How does ABS Watcher work?

ABS watcher essentially mimics the internal (non-functioning) Audiobookshelf watcher, by watching the same folders on the Windows system, and sending notifications to ABS via API (introduced in ABS v2.5.0) when it detects changes.

ABS Watcher:

1. Inspects your ABS Docker container to learn which Windows folders are mapped to which Docker folders.
2. Logs in to your ABS server.
3. Reads your ABS libraries metadata, which includes the Docker folders that comprise each library.
4. Translates library Docker folders into Windows folders, using the mapping from step 1.
5. Sets up a watch for changes on all library Windows folders.
6. Sends a notification to ABS whenever a file is added, removed, or renamed in one of the watched folders.

## Requirements

- On your Windows system:
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - _(optional)_ [Node.js](https://nodejs.org/en/download) for Windows, version 18 or above
- On Docker
  - [Audiobookshelf](https://www.audiobookshelf.org/) 2.5.0 or above, installed as a Docker container according to [this guide](https://www.audiobookshelf.org/guides/docker-install)

## Installation

If you installed Node.js on your Windows system, run:

```sh
npm install -g abswatcher
```

If you did not install Node.js, and don't want to bother installing it, you can:

- download [abswatcher.exe](https://github.com/mikiher/abswatcher/releases/download/0.3.0/abswatcher.exe)
  - abswatcher.exe is the ABS Watcher Node.js app packaged with a Node.js runtime that runs it
- put it in whatever directory you like
- add that directory to your system's PATH environemnt variable.

## Usage

```console
Usage: abswatcher --username <username> --password <password> [-c container | -m path-mappings]

Options:
      --help          Show help                                           [boolean]
      --version       Show version number                                 [boolean]

  -u, --username      Audiobookshelf username                   [string] [required]
  -p, --password      Audiobookshelf password                   [string] [required]
  -s, --server        URL of the Audiobookshelf server          [string] [required]
                                                [default: "http://127.0.0.1:13378"]

  -c, --container     Name of the Audiobookshelf Docker container          [string]
                                                   [required if -m is not provided]

  -m, --path-mappings `/local/path=/remote/path` folder pairs              [string]
                          (comma-separated)        [required if -c is not provided]
```

### username and password

Your ABS username and password. The user must be a root type account (in most cases, it should be "root").

### server

The URL of your ABS server (defaults to [http://127.0.0.1:13378](http://127.0.0.1:13378)). Note that in order for ABS Watcher to work properly, the server has to be up and running.

### container

The name of your ABS Docker container (defaults to "audiobookshelf-audiobookshelf-1", no need to change it if you followed the ABS Windows installation guide).

### path-mappings

Local=Remote folder pairs (comma-separated) to define how local paths map to remote paths in the Docker container.
