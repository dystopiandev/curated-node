 #  Curated [Node]
 > Not a framework. Not a module. Just a bunch of Node.js packages you most likely familiar with and probably already use, bundled together in a modular fashion.

- [Introduction](#introduction)
  - [What is this?](#what-is-this)
  - [Who asked for this and why?](#who-asked-for-this-and-why)
  - [How do I use this?](#how-do-i-use-this)
- [Documentation](#documentation)
  - [Package structure](#package-structure)
  - [Features](#features)
    - [TypeScript](#typescript)
    - [Bundles](#bundles)
  - [Coding conventions](#coding-conventions)


## Introduction
### What is this?
An arsenal of classes composed of npm packages and code snippets, grouped by use-cases and offered as neatly structured classes of reusable functionalities and resources, aiming to reduce the amount of code you need to type to get stuff done, without a 'framework-ish' learning curve. I initially wrote these classes to practise object-oriented TypeScript, but I use it in production apps today.

### Who asked for this and why?
I did. With this package alone, one can quickly deploy a HTTP/Socket.IO server with persistence and task management with much less boilerplate code, but that's not the catch...

All major versions will maintain structure and function signatures all through their lifespan. I've structured it this way to escape having to refactor 20 codebases with similar code.

### How do I use this?
Read the class sources after the base documentation in this guide, and if you like them, feel free to use all or any them. If you don't like an implementation, simply import and extend the concerned class to override the concerned methods in your code.

## Documentation
I'll try to offer more detailed docs on each class in this package, but until then, read the code and decide what you want to use.

### Package structure
This is not a module. For fluidity, all kernels, modules and services are offered as classes. There are no states/instances, factories or dependency injections. The classes are relatively coupled, but you decide when to extend or create instances.

For maintainability and ease-of-use, separation of concerns is favoured over classification by context in architecture of classes. Every component is granularly crafted or at least I've tried to make it so.

### Features
#### TypeScript
It's all written in TypeScript for easy consumption.
I aim to strongly type every bit of this codebase.
If I've missed something so far, I'll eventually find and slap a type on it.

#### Bundles
- **Components**

  Components are classes tailored for functionalities that complete other bundle components and more. They have no base classes.

  - ExpressRouterWrapper
  - GracefulSignalShutdown
  - SocketIONamespace

- **Kernels**

  Kernels are *bootable* bundle classes. They extend the abstract `_BaseKernel` class, to offer `boot()` and `halt()` methods. The halt method will return true if kernel was gracefully halted, and false otherwise.

  - ExpressKernel
  - SocketIOKernel

- **Modules**

  Modules are *component* bundle classes. They extend the abstract `_BaseModule` class.

  - LogModule
  - RabbitMQModule
  - RedisModule
  - SessionModule

- **Utils**

  Utils are helper classes. They also have no base classes.

  - FunctionUtils
  - ObjectUtils
  - PromiseUtils
  - StringUtils

### Coding conventions
- Class names are Pascal-cased
- Class members are camel-cased
- Private class properties have an underscore prefix
- Class properties are made public with getters/setters with the leading underscores removed
- Abstract classes have an underscire prefix
