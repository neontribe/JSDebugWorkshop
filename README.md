# JSDebugWorkshop
Neontribe's Javascript Debugging Workshop - made for NorDevCon 2016

## Abstract
At Neontribe we've been learning Javascript for the last 10 years or so. In that time we've written a lot of bugs. We're pretty sure we haven't found them all yet.

In this workshop we'll start with an overview of the portions of the Chrome Dev Tools which are particularly relevant to inspecting and debugging Javascript in the browser. If you've used the tools at all some of this material will be familiar so we'll try to uncover a few tricks along the way.

We'll cover different uses of the console, some of which will be of special interest to those coming to Javascript from environments where the use of a REPL is rarer. We'll also provide an introduction to the use of the interactive debugger and related tools.

As we progress we'll explore how to use the same features to interact with Javascript running in node, we'll uncover some different approaches to narrowing down your bug hunt using the profiling tools and we'll peer into the murky depths where memory leaks live.

Depending on time and interest we may also find ourselves covering topics such as attaching debuggers to remote environments, post-mortem debugging, the use of HAR files in diagnosing problems in browser to server communications and specialized debugging tools for specific frameworks.

## Caveat

We love Chromium and Firefox too, and much of what we'll discuss is applicable there too.

## Prerequisites
To save valuable workshop time it'd be great if participants can ensure the machine they bring with them satisfies the following:

* An up-to-date Google Chrome
* A modern Node.js and npm  
* A working command line environment
* A comfortable text editor

  *If you're new to node we'd recommend managing your node and npm versions with [nvm](https://github.com/creationix/nvm)*

It'd be super excellent to git clone this repo, enter the resulting directory, and run `npm install` before the workshop while you're on a decent internet connection.

## Slides

[http://neontribe.github.io/JSDebugWorkshop](http://neontribe.github.io/JSDebugWorkshop)
