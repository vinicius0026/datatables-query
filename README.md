# datatablesQuery

datatablesQuery is a module for making the integration between front-end tables using
[datatables](https://www.datatables.net/) and a REST API, node.js, express, MongoDB and Mongoose backed Servers, easier.

The main purpose is dealing with server side processing available in datatables, making it easy to integrate client and
server.

## Getting Started

Install the module.

```
npm install datatables-query
```

In your front-end, configure your DataTable to use serverSide processing and Ajax. The request type MUST be 'POST'.

```javascript
// jQuery way
$('#example').DataTable( {
    serverSide: true,
    ajax: {
        url: '/path/to/api/endpoint',
        type: 'POST'
    }
} );
```


```javascript
// Angular way - @see https://l-lin.github.io/angular-datatables/#/serverSideProcessing for full example

vm.dtOptions = DTOptionsBuilder.newOptions()
    .withOptions('serverSide', true)
    .withOptions('ajax', {
        url: '/path/to/api/endpoint',
        type: 'POST'
    })
    .// all other options

```

In your server, you MUST use `body-parser` with `urlencoded extended`

```javascript
var app = express();

app.use(bodyParser.urlencoded({extended: true});
```


In the route handler, import the module and pass a reference to the mongoose model you wish to use as data source.

The DataTables params will get caught in the request body. It should be passed to the run method, which will return a
promise.

```javascript

app.post('/path/to/api/endpoint', function (req, res) {
    var Model = require('./path/to/model'),
        datatablesQuery = require('datatables-query'),
        params = req.body,
        query = datatablesQuery(Model);

    query.run(params).then(function (data) {
        res.json(data);
    }, function (err) {
        res.status(500).json(err);
    });
};
```

That's all folks. Your table should be working just fine.

## Assumptions

As noted above, it is assumed that the server parses the request using extended urlencoded and that the data object is
a Mongoose object.

Datatables with serverSide processing enabled makes POST requests with content-type `application/x-www-form-urlencoded`,
and express' module body parser makes it easiear to work with this data, transforming it to JSON and parsing arrays and
objects.

## Using Without Datatables

One could use this module without datatables in the front-end making requests. For this to work, the POST body must
be a configuration object equivalent to the one shown below:

```javascript
// req.body should be equivalent to:
{
    "draw": "3",  // datatable stuff, but is mandatory nonetheless
    "start": "0",
    "length": "10",
    "search": {
        "value": ""
    },
    "columns": [
        {
            "data": "name", // field name in the MongoDB Schema
            "searchable": "true", // mandatory
            "orderable": "true" // mandatory
        },
        {
            // .. same structure as above for each field
        }
    ],
    "order": [
        {
            "column": "1", // index of the column used for sorting
            "dir": "asc" // direction of sorting ('asc' | 'desc')
        }
    ]
}
```

## TODO

- Add examples to this repo
- Implement filter by column
- Add tests to the 'run' method

## Contributing

Feel free to fork and mess with this code. But, before opening PRs, be sure that you adhere to the Code Style and Conventions
(run `grunt lint`) and add/correct as many tests as needed to ensure your code is working as expected.

## License

The MIT License (MIT)

[![Fiddus Tecnologia](http://fiddus.com.br/assets/img/logo-site.png)](http://fiddus.com.br)

Copyright (c) 2015 Vinicius Teixeira vinicius0026@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
