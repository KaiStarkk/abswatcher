## What is ABS Watcher?

This small Node app is an external library watcher for Audiobookshelf (a.k.a ABS).

### What is a watcher?

A watcher is a software that watches file system directories and files for changes. 

ABS has library watchers that watch the ABS library folders for changes. 

For example, if you move some new audiobook files to one of the library folders, ABS will automatically get notified of the new files by the library watcher, and it will add them to the library.

### Why do I need ABS Watcher?

If you installed Audiobookshelf on Windows as a Docker container (by following this [guide](https://www.audiobookshelf.org/guides/docker-install)), you might find out that your library watchers are not working as intended, and that ABS does not get notified when changes happens in one of your libraries. 

<details><summary>Why are they not working?</summary> test test test</details>


To fix this issue, you need to run ABS Watcher on your Windows system.

## Requirements
* On your Windows system:
    * [Docker Desktop](https://www.docker.com/products/docker-desktop/)
    * [Node.js](https://nodejs.org/en) 18 or above (optional)
* On Docker
    * [Audiobookshelf](https://www.audiobookshelf.org/) 2.5.0 or above, installed as a Docker container according to [this guide](https://www.audiobookshelf.org/guides/docker-install)

Without any changes, this app is connected to a Contentful space with read-only access. To experience the full end-to-end Contentful experience, you need to connect the app to a Contentful space with read _and_ write access. This enables you to see how content editing in the Contentful web app works and how content changes propagate to this app.

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
