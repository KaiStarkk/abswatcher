## What is ABS Watcher?

This small Node app is an external library watcher for Audiobookshelf (a.k.a ABS).

### What is a watcher?

A watcher is a software that watches file system directories and files for changes. 

ABS has library watchers that watch the ABS library folders for changes. 

For example, if you move some new audiobook files to one of the library folders, ABS will automatically get notified of the new files by the library watcher, and it will add them to the library.

### Why do I need ABS Watcher?

If you installed Audiobookshelf on Windows as a Docker container (by following this [guide](https://www.audiobookshelf.org/guides/docker-install)), you might find out that your library watchers are not working as intended, and that ABS does not get notified when changes happens in one of your libraries. 

<details><summary>Why are the ABS watchers not working?</summary>
In most cases, Docker Desktop on Windows is installed on WSL (Windows Subsystem for Linux) 2. 

This means that your Docker containers run on an isloated Linux virtual machine, so by default they cannot see your Windows drives and folders. In order to make Windows folders visible to Your docker container, you define them as Docker volumes. 

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

Watching for changes, however, will not work in most cases, because it relies on notifications from the operating system hosting the watched folder (Windows, in our case), and those notifications are not passed from Windows to WSL. 

So, in our example, any changes made to F:\audiobooks by any Windows application, will not be visible to the ABS library watcher (running on WSL).
</details>


To fix this issue, you need to run ABS Watcher on your Windows system.

## Requirements
* On your Windows system:
    * [Docker Desktop](https://www.docker.com/products/docker-desktop/)
    * [Node.js](https://nodejs.org/en) 18 or above (optional)
* On Docker
    * [Audiobookshelf](https://www.audiobookshelf.org/) 2.5.0 or above, installed as a Docker container according to [this guide](https://www.audiobookshelf.org/guides/docker-install)

## Installation

If you installed Node.js on your Windows system, run:

```sh
npm install -g abswatcher
```

If you did not install Node.js, and don't want to bother installing it, you can: 
* download [abswatcher.exe]()
* put it in whatever directory you like
* add that directory to your system's PATH environemnt variable.

## Usage

```console
Usage: abswatcher --username <username> --password <password> [options]

Options:
      --help       Show help                                           [boolean]
      --version    Show version number                                 [boolean]
  -u, --username   Audiobookshelf username                   [string] [required]
  -p, --password   Audiobookshelf password                   [string] [required]
  -s, --server     URL of the Audiobookshelf server
                                    [string] [default: "http://127.0.0.1/13378"]
  -c, --container  Name of the Audiobookshelf Docker container
                           [string] [default: "audiobookshelf-audiobookshelf-1"]
```

### username and password
Your ABS username and password. The user must be a root type account (in most cases, it should be "root")
### server
The URL of your ABS server (defaults to "http://127.0.0.1:13378"). Note that in order for ABS Watcher to work properly, the server has to be up and running.
### container
The name of your ABS Docker container (defaults to "audiobookshelf-audiobookshelf-1", no need to change it if you followed the ABS Windows installation guide)
