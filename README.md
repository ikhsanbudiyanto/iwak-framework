# iwak-framework
A node micro-framework based on express.js


## Instalation

Since this framework is published to npm, you can install this with following command:

```shell
$ npm install --save iwak-framework
```

## Getting Started

> This is minimal configuration tutorial to make your project running.

First of all, you need to make project structure like this:

```
.
├── app
│   ├── controllers
│   │   └── // your controller files lay down here
│   ├── libraries
│   ├── middleware
│   │   └── // your middleware files lay down here
│   ├── models
│   │   ├── // your data model files
│   ├── routes.js <-- this is file where you can define HTTP routes
│   └── views
│       └──  // your html files
├── config
│   ├── app.js 
│   ├── database.js
│   └── http.js
├── knexfile.js
├── npm_modules // you should learn node js first if you don't know this
├── migrations
│   └── // your migration files
├── package.json // you should learn node js first if you don't know this
├── public <-- directory for public and static files
├── server.js <-- main file
└── .env
```

Now, let see `config/app.js` file, it must contain an express configuration, i.e setting `Access-Control-Allow-Origin`. As you expect, it just contain express middleware like this:

```js
+ 'use strict';
+
+ module.exports = function (app) {
+  app.use(function(req, res, next) {
+    res.header("Access-Control-Allow-Origin", "*");
+    res.header("Access-Control-Allow-Headers", "X-Requested-With");
+    next();
+  });
+ };
```

then, we'll focus on file `config/database.js`. This file will be loaded by `iwak-framework` with `bookshelf` object, so you must write it like follow:

```js
+ 'use strict';
+ module.exports = function (bookshelf) {
+
+ };
```

and, since it will retreive `bookshelf` object, so you can add plugin on it:

```
+ 'use strict';
+ module.exports = function (bookshelf) {
+   bookshelf.plugin('visibility');
+   bookshelf.plugin('pagination');
+ };
```

Now, for file `config/http.js`. It contain http server and will be loaded by `iwak-framework` with `express` object:

```js
+ 'use strict';
+ const http   = require('http');
+ 
+ module.exports = function (app) {
+   const server = http.Server(app);
+ 
+   server.listen(env('APP_PORT', 3000), function () {
+     console.info('Listening on post 3000');
+   });
+ };
```

Ok, then in file `server.js` where located in project root, we'll put this code to make app running:

```js
+ 'use strict';
+
+ const app = require('iwak-framework');
+
+ require('./app/routes');
+ require('./config/http')(app);
+ require('./config/boot');
```

> Wait, what is app/routes?

Sorry, I'm not forget it, but now I will tell you what is it.

`app/routes.js` will contain http route code. For example, you can write:

```js
+ 'use strict';
+
+ const Route = use('Route');
+
+ Route.group({namespace: 'api', prefix: '/api'}, (Route) => {
+
+   Route.get('/', 'ExampleController.index');
+
+ }).error('json');

```

> Then make another directory inside `controller` with name `api` and make `ExampleController.js` inside it.

In `ExampleController.js` write this:

```js
+ 'use strict';
+
+ const Validator = use('Validator');
+ const Response  = use('Response');
+ const co = use('co');

+ class UserController {
+   constructor() {
+  }
+
+  index(req, res, next) {
+    let data = {
+       status: true,
+       data: {
+         foo: "bar"
+      }
+    }
+
+    return Response.success(res, data);
+   }
+ }
```

And last, set environment variable in `.env` file:

```
+ NODE_ENV=development
+ 
+ APP_NAME=
+ APP_PORT=3000
+ APP_HOST=127.0.0.1
+ APP_DEBUG=true
+ APP_KEY=
+ 
+ DB_CLIENT=postgresql
+ DB_HOST=127.0.0.1
+ DB_PORT=
+ DB_DATABASE=
+ DB_USERNAME=
+ DB_PASSWORD=
+ DB_MAX_CONNECTION=1
+ DB_MAX_CONNECTION=
+ 
+ TOKEN_SECRET=secret
```

### Running server

```shell
$ node server.js
```

Done! Now access to [http://localhost:3000/api/example](http://localhost:3000/api/example) it should return following json:

```json
+ {
+   status: true,
+   data: {
+     foo: "bar"
+   }
+ }
```

